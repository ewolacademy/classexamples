// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Ewol is Ownable {
  uint256 stateVar;

  event StateVarChange(uint256 oldValue, uint256 newValue);

  constructor (uint256 _initialState) {
    stateVar = _initialState;
  }

  function setVar(uint256 _value) public onlyOwner {
    require(_value <= 100, "Var value can't be larger than 100");
    uint256 oldValue = stateVar;
    stateVar = _value;
    emit StateVarChange(oldValue, _value);
  }

  function getVar() public view returns (uint256) {
    return stateVar;
  } 
}