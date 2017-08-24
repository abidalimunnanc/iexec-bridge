var IexecWorksGateway = artifacts.require("./IexecWorksGateway.sol");
contract('IexecWorksGateway', function(accounts) {
  // need the bridge to have the right contract, so you have to migrate before test
  console.log("test start");
  it("should submit", function() {

    var IexecWorksGatewayInstance;
    return IexecWorksGateway.at("0x4a1cdfbd30a9e4ac4992dee62c87ceb49bbcbf1a").then(function(instance) {
      IexecWorksGatewayInstance = instance;
      console.log(instance);
      IexecWorksGatewayInstance.submit("test", "param1");
      // do something
      //return instance.getBalance.call(accounts[0]);
//    }).then(function(balance) {

      // Assert something
      //assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    });
  });
});
