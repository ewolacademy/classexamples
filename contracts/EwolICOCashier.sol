// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./EwolToken.sol";

contract EwolICOCashier is Ownable {

    uint256 public constant TOKEN_PRICE = 2 gwei;

    EwolToken public ewolTokenInstance;

    mapping (address => uint256) public totalBought;
    mapping (address => bool) public collectedReward;

    event TokensSold(address indexed _buyer, uint256 _amount);

    error WrongAmount(uint256 _tokensAmount, uint256 _ethAmount);

    constructor (uint256 _tokensToIssue) {
        ewolTokenInstance = new EwolToken(_tokensToIssue);
        require(_myBalance() == _tokensToIssue, "Token deployed with errors");

        ewolTokenInstance.transferOwnership(msg.sender); // Transfers ownership of token contract to ICO contract owner/deployer
    }

    modifier isSuperBuyer(address _buyer) {
        require(totalBought[_buyer] >= 100, "Buyer is not a SUPERBUYER");
        _;
    }

    function buyTokens(uint256 _amount) public payable {
        if (msg.value != _amount * TOKEN_PRICE) {
            revert WrongAmount(_amount, msg.value);
        }
        ewolTokenInstance.transfer(msg.sender, _amount);

        totalBought[msg.sender] += _amount;

        emit TokensSold(msg.sender, _amount);
    }

    function getSuperBuyerReward() public isSuperBuyer(msg.sender) {
        require(!collectedReward[msg.sender], "Already received the reward");
        ewolTokenInstance.transfer(msg.sender, 10);
        collectedReward[msg.sender] = true;
    }
    
    function withdrawEth() public onlyOwner {
        uint _ethBalance = address(this).balance;
        payable(msg.sender).transfer(_ethBalance);
    }
    
    function withdrawEth(uint256 _ethAmount) public onlyOwner {
        require(address(this).balance >= _ethAmount, "Not enough balance to withdraw");
        payable(msg.sender).transfer(_ethAmount);
    }

    function _myBalance() private view returns(uint256) {

        return ewolTokenInstance.balanceOf(address(this));
    }
}