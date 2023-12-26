// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IDO.sol";
import "../interface/IIdo.sol";

contract IDOFactory is Ownable {
    mapping(address => address[]) private idos;

    address[] public allIdos;

    event NewIDOCreated(address indexed idoAddress, address indexed idoOwner);

    function createIDO(
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
    ) external {
        address idoAddress = address(new IDO());
        allIdos.push(idoAddress);
        idos[_msgSender()].push(idoAddress);
        IIdo(idoAddress).initialize(
            idoOwner,
            tokenTotalSupply,
            idoTokenPercent,
            minimumMemeTokens,
            minMemeTokenToParticipate,
            idoToken,
            memeToken,
            idoStartTime,
            idoBFATime,
            idoEndTime,
            claimableTime
        );

        emit NewIDOCreated(idoAddress, idoOwner);
    }

    function getIdos(
        address _account
    ) external view returns (address[] memory) {
        return idos[_account];
    }
}
