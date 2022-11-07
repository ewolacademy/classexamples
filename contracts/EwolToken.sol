// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EwolToken is ERC20, Ownable {

    mapping (address => bool) public isBlacklisted;
    mapping (address => bytes32) public blacklistChangeReason;

    constructor(uint256 _initialMint) ERC20("Ewol SuperToken", "EWOL") {
        _mint(msg.sender, _initialMint);
    }

    function setBlacklistState(address _offender, bool _blacklistState, string calldata _reason) public onlyOwner {
        isBlacklisted[_offender] = _blacklistState;
        blacklistChangeReason[_offender] = keccak256(abi.encodePacked(_reason));
    }

    function isBlacklistChangeReason(address _offender, string calldata _reason) public view returns(bool) {
        bytes32 _reasonHash = keccak256(abi.encodePacked(_reason));
        if (blacklistChangeReason[_offender] == _reasonHash) {
            return true;
        }
        return false;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 /*amount*/
    ) internal override view {
        require(isBlacklisted[from] == false, "Transfer originator is blacklisted");
        require(isBlacklisted[to] == false, "Transfer destination is blacklisted");
    }


}
