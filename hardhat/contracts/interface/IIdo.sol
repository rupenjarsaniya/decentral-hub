//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../IDO/IDOStorage.sol";

interface IIdo {
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
    ) external;
}
