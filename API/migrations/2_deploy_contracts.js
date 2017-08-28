var IexecOracle = artifacts.require("./IexecOracle.sol");
var LS = artifacts.require("./LS.sol");


module.exports = function(deployer) {
  return deployer.deploy(IexecOracle)
    .then(() => IexecOracle.deployed())
    .then(instance => {
      console.log("IexecOracle deployed at address :" + instance.address)
      return LS.new(instance.address);
    })
    .then(instance => console.log("LS deployed at address :" + instance.address));
};
