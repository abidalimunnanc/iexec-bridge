var XtremWebInterface = artifacts.require("./XtremWebInterface.sol");
contract('XtremWebInterface', function(accounts) {
  // need the bridge to have the right contract, so you have to migrate before test
  console.log("test start");
  it("should submit", function() {

    var XtremWebInterfaceInstance;
    return XtremWebInterface.at("0x141034a565abba754e9b3f64f847051f4e17a63f").then(function(instance) {
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
