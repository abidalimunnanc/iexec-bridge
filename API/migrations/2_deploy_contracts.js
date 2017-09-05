var IexecOracle = artifacts.require("./IexecOracle.sol");
var HelloWorld = artifacts.require("./HelloWorld.sol");


module.exports = function(deployer) {
  return deployer.deploy(IexecOracle)
    .then(() => IexecOracle.deployed())
    .then(instance => {
      console.log("IexecOracle deployed at address :" + instance.address)
      return HelloWorld.new(instance.address);
    })
    .then(instance => console.log("HelloWorld deployed at address :" + instance.address));
};
