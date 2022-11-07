const {
  anyValue
} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {
  expect
} = require("chai");

const signers = {};
let icoCashierFactory;
let icoCashierInstance;
let icoCashierAddr;

let tokenFactory;
let tokenInstance;
let tokenAddr;

const TOTAL_TO_ISSUE = 10000;

describe("EwolICOCashier Test", function () {

  it("Should deploy the smart contract", async function () {
    const [
      deployer,
      firstUser,
      secondUser
    ] = await ethers.getSigners();
    signers.deployer = deployer;
    signers.firstUser = firstUser;
    signers.secondUser = secondUser;
  });

  describe("Deployment", function () {

    it(`Should deploy the smart contract for ${TOTAL_TO_ISSUE} tokens`, async function () {
      icoCashierFactory = await ethers.getContractFactory("EwolICOCashier", signers.deployer);
      icoCashierInstance = await icoCashierFactory.deploy(TOTAL_TO_ISSUE);
      await icoCashierInstance.deployed();
      icoCashierAddr = icoCashierInstance.address;
      console.log('Contract EwolICOCashier deployed to:', icoCashierAddr);
    });

    it(`Should assign ${TOTAL_TO_ISSUE} tokens to the ICO Cashier`, async function () {
      tokenAddress = await icoCashierInstance.ewolTokenInstance();
      console.log("Contract EwolToken deployed to:", tokenAddress);
      tokenFactory = await ethers.getContractFactory("EwolToken", signers.deployer);
      tokenInstance = tokenFactory.attach(tokenAddress);
      const balaceOfICOCashier = await tokenInstance.balanceOf(icoCashierAddr);
      expect(balaceOfICOCashier)
        .to.equal(TOTAL_TO_ISSUE);
    });
  });

  describe("Tokens Sale", function () {
    it("Should allow contract deployer to blacklist users", async function () {
      const firstUserAddr = await signers.firstUser.getAddress();
      const setBlacklistTx = await tokenInstance.setBlacklistState(
        firstUserAddr,
        true /* lo quiero blacklistear */ ,
        "Because she is a terrorist"
      );
      await setBlacklistTx.wait();

      expect(await tokenInstance.isBlacklisted(firstUserAddr))
        .to.equal(true);

      expect(await tokenInstance.isBlacklistChangeReason(firstUserAddr, "Because she is a terrorist"))
        .to.equal(true);

      expect(await tokenInstance.isBlacklistChangeReason(firstUserAddr, "Because she is a bank robber"))
        .to.equal(false);
    });

    it("Should allow a valid user to buy tokens", async function () {
      const secondUserAddr = await signers.secondUser.getAddress();
      const icoCashierInstanceForSecondUser = await icoCashierInstance.connect(signers.secondUser);

      const buyTokensTx = await icoCashierInstanceForSecondUser.buyTokens(5, {
        value: ethers.utils.parseUnits("10.0", "gwei")
      });

      expect(await tokenInstance.balanceOf(secondUserAddr))
        .to.equal(5);
    });

    it("Should allow a block a blacklisted user from buying tokens", async function () {
      const firstUserAddr = await signers.firstUser.getAddress();
      const icoCashierInstanceForFirstUser = await icoCashierInstance.connect(signers.firstUser);

      const failedBlacklistBuyTokensTx = icoCashierInstanceForFirstUser.buyTokens(5, {
        value: ethers.utils.parseUnits("10.0", "gwei")
      });

      expect(failedBlacklistBuyTokensTx)
        .to.revertedWith("Transfer destination is blacklisted");
    });

  });
});
