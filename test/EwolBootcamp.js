const {
  anyValue
} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {
  expect
} = require("chai");

const signers = {};
let contractFactory;
let contractInstance;
let contractAddr;

describe("EwolBootcamp Test", function () {

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

    it("Should deploy the smart contract", async function () {
      contractFactory = await ethers.getContractFactory("Ewol", signers.deployer);
      contractInstance = await contractFactory.deploy(14);
      await contractInstance.deployed();
      contractAddr = contractInstance.address;
      console.log('Contract Ewol deployed to:', contractAddr);
    });

    it('Should have an initial state variable value of 14', async function () {
      const initialStateVarValue = await contractInstance.getVar();
      expect(initialStateVarValue)
        .to.equal(14);
    });

    it('Should have the deployer as contract owner', async function () {
      const expectOwner = await signers.deployer.getAddress();
      const contractOwner = await contractInstance.owner();
      expect(contractOwner)
        .to.equal(expectOwner);
    });
  });

  describe("State Var Usage", function () {
    it("Should set the state var to 100", async function () {
      const setVarTx = await contractInstance.setVar(100);
      const setVarReceipt = await setVarTx.wait();
      console.dir({
        setVarTx,
        setVarReceipt
      }, {
        depth: null
      });
    });

    it("Should confirm the state var is 100", async function () {
      const newStateVarValue = await contractInstance.getVar();
      expect(newStateVarValue)
        .to.equal(100);
    });

    it("Should not be able to set the state var to 101", async function () {
      const failedTooLargeSetVarTx = contractInstance.setVar(101);
      expect(failedTooLargeSetVarTx)
        .to.be.revertedWith("Var value can't be larger than 100");
    });

    it("Should not be able to set the state var if not the owner", async function () {
      const contractInstanceForFirstUser = await contractInstance.connect(signers.firstUser);

      const failedNotOwnerSetVarTx = contractInstanceForFirstUser.setVar(10);
      expect(failedNotOwnerSetVarTx)
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
