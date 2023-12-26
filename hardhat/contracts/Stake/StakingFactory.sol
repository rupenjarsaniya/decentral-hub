// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Staking.sol";

contract StakingFactory {
    mapping(address => address[]) private stakes;

    address[] public allStakes;

    event NewStakeCreated(
        address indexed stakeAddress,
        address indexed stakeOwner
    );

    function createStake(
        address _tokenAddress,
        uint256 _interestRate
    ) external {
        address stakeAddress = address(
            new Staking(_tokenAddress, _interestRate, msg.sender)
        );
        allStakes.push(stakeAddress);
        stakes[msg.sender].push(stakeAddress);

        emit NewStakeCreated(stakeAddress, msg.sender);
    }

    function getStakes(
        address _account
    ) external view returns (address[] memory) {
        return stakes[_account];
    }
}
