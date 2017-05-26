var WorkInterface = artifacts.require("./WorkInterface.sol");
contract('AppInterface', function(accounts) {
  it("should make something", function() {
    return WorkInterface.deployed().then(function(instance) {
      
      // do something
      //return instance.getBalance.call(accounts[0]);
    }).then(function(balance) {

      // Assert something
      //assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    });
  });
});
