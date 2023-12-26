// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IDOStorage.sol";
import "../interface/IMemeToken.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract IDO is IDOStorage {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IMemeToken;

    constructor() {
        factory = msg.sender;
    }

    modifier onlyOwner() {
        require(
            msg.sender == idoInfo.idoOwner,
            "IDO: Only IDO owner can call this function"
        );
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "IDO: Only factory can initialize IDO");
        _;
    }

    function initialize(
        address idoOwner,
        uint256 tokenTotalSupply,
        uint256 idoTokenPercent,
        uint256 minimumMemeTokens,
        uint256 minMemeTokenToParticipate,
        address idoToken,
        address memeToken,
        uint256 idoStartTime,
        uint256 idoBFATime,
        uint256 idoEndTime,
        uint256 claimableTime
    ) public onlyFactory {
        require(!isInitialized, "IDO: IDO was already initialized");
        require(memeToken != address(0), "IDO: Invalid meme token address");
        require(idoToken != address(0), "IDO: Invalid token address");
        require(idoTokenPercent > 0, "IDO: Invalid tokens for sale");
        require(idoStartTime >= block.timestamp, "IDO: Invalid IDO start time");
        require(idoEndTime > idoStartTime, "IDO: Invalid IDO end time");
        require(
            claimableTime > idoEndTime && claimableTime > idoStartTime,
            "IDO: Invalid claimable time"
        );
        require(minimumMemeTokens > 0, "IDO: Invalid minimum meme tokens");
        require(
            minMemeTokenToParticipate > 0,
            "IDO: Invalid minimum meme tokens to participate"
        );

        IDOInfo memory _idoInfo = IDOInfo(
            idoOwner,
            tokenTotalSupply,
            idoTokenPercent,
            minimumMemeTokens,
            minMemeTokenToParticipate
        );

        IDOTimeInfo memory _idoTimeInfo = IDOTimeInfo(
            idoStartTime,
            idoBFATime,
            idoEndTime,
            claimableTime
        );

        Tokens memory _tokens = Tokens(idoToken, memeToken);

        idoInfo = _idoInfo;
        idoTimeInfo = _idoTimeInfo;
        tokens = _tokens;
        idoState = IDOState.NOT_STARTED;
        tokensLeft = ((idoTokenPercent.mul(tokenTotalSupply)).div(100));
        isInitialized = true;

        emit IDOInitialized(
            idoOwner,
            idoToken,
            tokensLeft,
            minimumMemeTokens,
            minMemeTokenToParticipate,
            idoStartTime,
            idoEndTime,
            claimableTime
        );
    }

    function startIDO() public onlyOwner {
        require(
            block.timestamp >= idoTimeInfo.idoStartTime,
            "IDO: IDO cannot start now"
        );
        require(idoState != IDOState.CANCELLED, "IDO: IDO has cancelled");
        require(
            idoState == IDOState.NOT_STARTED,
            "IDO: IDO has already started"
        );

        IERC20(tokens.idoToken).safeTransferFrom(
            msg.sender,
            address(this),
            tokensLeft
        );
        idoState = IDOState.STARTED;

        emit IDOStarted(idoInfo.idoOwner, block.timestamp);
    }

    function participate(uint256 _memeTokenAmount) external {
        require(idoState == IDOState.STARTED, "IDO: IDO has not started yet");
        require(
            block.timestamp >= idoTimeInfo.idoStartTime,
            "IDO: IDO has not started"
        );
        require(
            block.timestamp <= idoTimeInfo.idoBFATime,
            "IDO: IDO BFA time is over"
        );
        require(
            IMemeToken(tokens.memeToken).balanceOf(msg.sender) >=
                _memeTokenAmount,
            "IDO: Insufficient meme token balance"
        );
        require(
            _memeTokenAmount >= idoInfo.minMemeTokenToParticipate,
            "IDO: Minimum meme tokens to participate not met"
        );

        totalMemeTokensSent += _memeTokenAmount;
        participants[msg.sender].memeTokensSent += _memeTokenAmount;

        IMemeToken(tokens.memeToken).safeTransferFrom(
            msg.sender,
            idoInfo.idoOwner,
            _memeTokenAmount
        );

        emit ParticipatedInIDO(msg.sender, _memeTokenAmount, block.timestamp);
    }

    function claimIDOToken() external {
        require(
            idoState == IDOState.CLAIMABLE,
            "IDO: IDO has not claimable yet"
        );
        require(
            block.timestamp >= idoTimeInfo.claimableTime,
            "IDO: Claimable time has not passed yet"
        );
        require(
            participants[msg.sender].memeTokensSent > 0,
            "IDO: You do not have any meme tokens"
        );

        uint256 claimableTokenAmount = allocatedTokens();

        require(claimableTokenAmount > 0, "IDO: No IDO tokens to claim");

        IERC20(tokens.idoToken).safeTransfer(msg.sender, claimableTokenAmount);

        participants[msg.sender].totalClaimableIDOTokens = 0;
        tokensLeft -= claimableTokenAmount;

        emit IDOTokensClaimed(msg.sender, claimableTokenAmount);
    }

    function cancelIDO() public onlyOwner {
        require(
            idoState != IDOState.CANCELLED,
            "IDO: IDO has already cancelled"
        );
        require(
            idoState != IDOState.CLAIMABLE,
            "IDO: IDO has already claimable"
        );

        idoState = IDOState.CANCELLED;
    }

    function withdraw() external returns (bool) {
        require(
            idoState == IDOState.CANCELLED,
            "IDO: IDO has not cancelled yet"
        );
        require(
            participants[msg.sender].memeTokensSent > 0,
            "IDO: User has not participated in the IDO"
        );

        uint256 refundAmount = participants[msg.sender].memeTokensSent;
        IMemeToken(tokens.memeToken).safeTransferFrom(
            idoInfo.idoOwner,
            msg.sender,
            refundAmount
        );
        participants[msg.sender].memeTokensSent = 0;
        participants[msg.sender].totalClaimableIDOTokens = 0;

        return true;
    }

    function updateMinMemeTokens(uint256 _amount) public onlyOwner {
        idoInfo.minimumMemeTokens = _amount;
    }

    function updateClaimableTime(uint256 _claimableTime) public onlyOwner {
        idoTimeInfo.claimableTime = _claimableTime;
    }

    function endIDO() public {
        require(
            block.timestamp >= idoTimeInfo.idoEndTime,
            "IDO: Invalid request for change IDO state"
        );
        require(idoState == IDOState.STARTED, "IDO: IDO has not started yet");

        idoState = IDOState.ENDED;
    }

    function cliamableIDO() public {
        require(
            block.timestamp >= idoTimeInfo.claimableTime,
            "IDO: Invalid request for change IDO state"
        );
        require(idoState == IDOState.ENDED, "IDO: IDO has not ended yet");

        idoState = IDOState.CLAIMABLE;
    }

    // After IDO has end, contract gives 30 minutes to claim tokens. after contract ido has completed user cannot withdraw
    function completeIDO() public {
        require(
            block.timestamp >= idoTimeInfo.claimableTime + 30 minutes,
            "IDO: Invalid request for change IDO state"
        );
        require(
            idoState == IDOState.CLAIMABLE,
            "IDO: IDO has not claimable yet"
        );

        idoState = IDOState.COMPLETED;
    }

    function allocatedTokens() public view returns (uint256) {
        require(
            participants[msg.sender].memeTokensSent > 0,
            "IDO: User has not participated in the IDO"
        );

        uint256 participantClaimableIDOTokens = participants[msg.sender]
            .memeTokensSent;

        return participantClaimableIDOTokens;
    }

    function getClaimableTime() public view returns (uint256) {
        return idoTimeInfo.claimableTime;
    }

    function getIdoOwner() public view returns (address) {
        return idoInfo.idoOwner;
    }

    function getIdoStatus() public view returns (IDOState) {
        return idoState;
    }
}
