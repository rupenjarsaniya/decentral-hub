//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface IMemeToken is IERC20, IERC20Metadata {
    function mint(address _to, uint256 _amount) external;

    function burn(uint256 _amount) external;
}
