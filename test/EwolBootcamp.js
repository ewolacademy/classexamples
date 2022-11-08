const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const {
  anyValue
} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {
  expect
} = require("chai");

let defaultSigner;
let ewolContractFactory;
let ewolContractInstance;
let ewolContractAddr;

describe("Ewol", function () {
  it("Should deploy the contract", async function () {
    [defaultSigner] = await ethers.getSigners();
    ewolContractFactory = await ethers.getContractFactory("Ewol", defaultSigner);
    ewolContractInstance = await ewolContractFactory.deploy();

    await ewolContractInstance.deployed();
    ewolContractAddr = ewolContractInstance.address;
  });

  it("Should set the state var to 5", async function () {
    const setVarTx = await ewolContractInstance.setVar(5);
    setVarTx.wait();
  });

  it("Should check that the var value is 5", async function () {
    expect(await ewolContractInstance.getVar())
      .to.equal(5);
  });
});
