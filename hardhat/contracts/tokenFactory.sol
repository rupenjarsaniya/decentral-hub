// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./erc20Token.sol";

contract tokenFactory {
    event NewTokenCreated(address indexed tokenAddress, address indexed owner);

    function createERC20Token(
        string memory _token_name,
        string memory _token_symbol,
        uint256 _initial_supply,
        uint256 _max_supply
    ) external {
        address contractAddress = address(
            new erc20Token(
                _token_name,
                _token_symbol,
                _initial_supply,
                _max_supply,
                msg.sender
            )
        );

        emit NewTokenCreated(contractAddress, msg.sender);
    }
}
