var IexecWorksGateway = artifacts.require("./IexecWorksGateway.sol");
var LS = artifacts.require("./LS.sol");


module.exports = function(deployer) {
  return deployer.deploy(IexecWorksGateway)
    .then(() => IexecWorksGateway.deployed())
    .then(instance => {
      console.log("IexecWorksGateway deployed at address :" + instance.address)
      return LS.new(instance.address);
    })
    .then(instance => console.log("LS deployed at address :" + instance.address));
};
