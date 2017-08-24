var XtremWebInterface = artifacts.require("./XtremWebInterface.sol");
var LS = artifacts.require("./LS.sol");


module.exports = function(deployer) {
  return deployer.deploy(XtremWebInterface)
    .then(() => XtremWebInterface.deployed())
    .then(instance => {
      console.log("XtremWebInterface deployed at address :" + instance.address)
      return LS.new(instance.address);
    })
    .then(instance => console.log("LS deployed at address :" + instance.address));
};
