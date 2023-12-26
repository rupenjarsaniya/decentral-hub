// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract erc20Token is ERC20, Ownable {
    uint256 immutable maxSupply;

    constructor(
        string memory _token_name,
        string memory _token_symbol,
        uint256 _initial_supply,
        uint256 _max_supply,
        address _caller
    ) ERC20(_token_name, _token_symbol) {
        maxSupply = _max_supply * 10 ** decimals();

        _mint(_caller, _initial_supply * 10 ** decimals());
    }

    function mint(uint256 _supply) public onlyOwner {
        require(
            totalSupply() + _supply * 10 ** decimals() <= maxSupply,
            "erc20Token: Max supply limit is exceed"
        );

        _mint(msg.sender, _supply * 10 ** decimals());
    }
}
