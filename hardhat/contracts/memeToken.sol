// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract memeToken is ERC20, Ownable {
    using SafeMath for uint256;
    uint256 public price = 0.0001 ether;
    uint256 public availableTokens;

    event TokensBought(address indexed buyer, uint256 amount, uint256 cost);
    event TokensSold(address indexed seller, uint256 amount, uint256 revenue);

    constructor(uint256 _totalSupply) ERC20("Shimbu", "SH") {
        availableTokens = _totalSupply * 10 ** decimals();
        _mint(address(this), _totalSupply * 10 ** decimals());
    }

    function buy(uint256 _tokenAmount) external payable {
        require(
            _tokenAmount > 0,
            "memeToken: Token amount can not be zero or less"
        );
        require(
            availableTokens >= _tokenAmount,
            "memeToken: Insufficient meme tokens"
        );

        uint256 valueOfTokens = (_tokenAmount / 10 ** decimals()).mul(price);
        require(
            msg.value == valueOfTokens,
            "memeToken: Insufficient value of assets"
        );

        _transfer(address(this), _msgSender(), _tokenAmount);
        availableTokens = availableTokens.sub(_tokenAmount);

        emit TokensBought(_msgSender(), valueOfTokens, msg.value);
    }

    function sell(uint256 _tokenAmount) external {
        require(
            _tokenAmount > 0,
            "memeToken: Token amount can not be zero or less"
        );
        require(
            balanceOf(msg.sender) >= _tokenAmount,
            "memeToken: Insufficient balance to sell"
        );

        uint256 vauleOfTokens = (_tokenAmount / 10 ** decimals()).mul(price);
        transfer(address(this), _tokenAmount);
        payable(_msgSender()).transfer(vauleOfTokens);
        availableTokens = availableTokens.add(_tokenAmount);

        emit TokensSold(_msgSender(), _tokenAmount, vauleOfTokens);
    }

    function tokenPrice() public view returns (uint256) {
        return price;
    }
}
