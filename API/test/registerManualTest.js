var XtremWebInterface = artifacts.require("./XtremWebInterface.sol");
contract('XtremWebInterface', function(accounts) {
  // need the bridge to have the right contract, so you have to migrate before test
  console.log("test start");
  it("should submit", function() {

    var XtremWebInterfaceInstance;
    return XtremWebInterface.at("0x7845273b8ca53acd2d8c78f22718c70cc5b08431").then(function(instance) {
      XtremWebInterfaceInstance = instance;
      console.log(instance);
      return XtremWebInterfaceInstance.register("ls");
    }).then(txMined => {
      console.log(txMined);
      // do something
      //return instance.getBalance.call(accounts[0]);
//    }).then(function(balance) {

      // Assert something
      //assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    });
  });
});