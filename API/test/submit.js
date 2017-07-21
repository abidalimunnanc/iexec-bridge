var XtremWebInterface = artifacts.require("./XtremWebInterface.sol");
contract('XtremWebInterface', function(accounts) {
  // need the bridge to have the right contract, so you have to migrate before test
  console.log("test start");
  it("should submit", function() {

    var XtremWebInterfaceInstance;
    return XtremWebInterface.at("0x4a1cdfbd30a9e4ac4992dee62c87ceb49bbcbf1a").then(function(instance) {
      XtremWebInterfaceInstance = instance;
      console.log(instance);
      XtremWebInterfaceInstance.submit("test", "param1");
      // do something
      //return instance.getBalance.call(accounts[0]);
//    }).then(function(balance) {

      // Assert something
      //assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    });
  });
});
