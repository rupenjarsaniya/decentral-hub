// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

enum StakingStatus {
    STARTED,
    ENDED,
    PAUSED
}

contract Staking is ERC20, Pausable, ReentrancyGuard {
    address public tokenAddress;
    address public owner;

    uint256 public tokenBalance;
    uint256 public planDuration = 120; //7776000; // 90 Days (90 * 24 * 60 * 60)
    uint256 public interestRate;
    uint256 public totalStakers;

    StakingStatus public stakingStatus;

    struct StakeInfo {
        bool started;
        uint256 startTime;
        uint256 endTime;
        uint256 amount;
        uint256 claimed;
    }

    event Staked(address indexed from, uint256 amount);
    event Claimed(address indexed from, uint256 amount);

    mapping(address => mapping(uint256 => StakeInfo)) public stakeInfos;
    mapping(address => uint256) public stakeNumber;

    modifier onlyOwner() {
        require(msg.sender == owner, "Staking: Caller is not the owner");
        _;
    }

    constructor(
        address _tokenAddress,
        uint256 _interestRate,
        address _owner
    ) ERC20("vested Staking", "vStaking") {
        require(
            _tokenAddress != address(0),
            "Staking: Token address cannot be zero"
        );
        require(_interestRate > 0, "Staking: Interest rate cannot be zero");

        tokenBalance = 0;
        tokenAddress = _tokenAddress;
        interestRate = _interestRate;
        totalStakers = 0;
        stakingStatus = StakingStatus.STARTED;
        owner = _owner;
    }

    function stakeToken(
        uint256 stakeAmount
    ) external nonReentrant whenNotPaused {
        require(
            stakingStatus == StakingStatus.STARTED,
            "Staking: Not available"
        );
        require(stakeAmount > 0, "Staking: Invalid stake amount");
        require(
            ERC20(tokenAddress).balanceOf(msg.sender) >= stakeAmount,
            "Staking: Insufficient Balance"
        );

        bool success = ERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            stakeAmount
        );
        require(success, "Staking: Transfer failed");

        tokenBalance = ERC20(tokenAddress).balanceOf(address(this));

        require(
            !stakeInfos[msg.sender][stakeNumber[msg.sender]].started,
            "Staking: Invalid staking"
        );

        stakeInfos[msg.sender][stakeNumber[msg.sender]] = StakeInfo({
            started: true,
            startTime: block.timestamp,
            endTime: block.timestamp + planDuration,
            amount: stakeAmount,
            claimed: 0
        });

        if (stakeNumber[msg.sender] == 0) {
            totalStakers++;
        }

        stakeNumber[msg.sender]++;
        _mint(msg.sender, stakeAmount);

        emit Staked(msg.sender, stakeAmount);
    }

    function claimReward(
        uint256 amount,
        uint256 stakeId
    ) public nonReentrant returns (bool) {
        StakeInfo storage currStakeInfo = stakeInfos[msg.sender][stakeId];

        require(currStakeInfo.started, "Staking: Not available");
        require(
            currStakeInfo.endTime < block.timestamp,
            "Stake Time is not over yet"
        );
        require(
            (currStakeInfo.amount - currStakeInfo.claimed) >= amount,
            "Staking: Invalid amount"
        );

        uint256 totalTokens = amount + ((amount * interestRate) / 100);
        currStakeInfo.claimed += amount;
        tokenBalance = ERC20(tokenAddress).balanceOf(address(this));

        require(
            totalTokens <= tokenBalance,
            "Staking: Insufficient token balance"
        );

        _burn(msg.sender, amount);
        bool success = ERC20(tokenAddress).transfer(msg.sender, totalTokens);

        require(success, "Staking: Transfer failed");

        emit Claimed(msg.sender, totalTokens);
        return true;
    }

    function getStakeInfo(uint stakeId) public view returns (StakeInfo memory) {
        return stakeInfos[msg.sender][stakeId];
    }

    function updateInterestRate(uint256 _interestRate) public onlyOwner {
        interestRate = _interestRate;
    }

    function getInterestRate() public view returns (uint256) {
        return interestRate;
    }

    function pause() external nonReentrant whenNotPaused onlyOwner {
        stakingStatus = StakingStatus.PAUSED;
        _pause();
    }

    function unpause() external nonReentrant whenPaused onlyOwner {
        stakingStatus = StakingStatus.STARTED;
        _unpause();
    }

    function endStaking() external nonReentrant onlyOwner {
        stakingStatus = StakingStatus.ENDED;
    }
}
