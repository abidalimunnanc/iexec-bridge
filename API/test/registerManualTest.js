var LS = artifacts.require("./LS");
contract('LS', function(accounts) {
  // need the bridge to have the right contract, so you have to migrate before test
  console.log("test start");
  it("should submit", function() {

    var LSInstance;
    return LS.at("0x412d294d5894f7038f083788bea1f102ed135d21").then(function(instance) {
      LSInstance = instance;
      console.log(instance);
      return LSInstance.iexecLS();
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
