var AppInterface = artifacts.require("./AppInterface.sol");
var WorkInterface = artifacts.require("./WorkInterface.sol");

module.exports = function(deployer) {
  deployer.deploy(WorkInterface);
  deployer.deploy(AppInterface);
};
