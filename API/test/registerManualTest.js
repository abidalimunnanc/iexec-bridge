var HelloWorld = artifacts.require("./HelloWorld");
contract('HelloWorld', function(accounts) {
  // need the bridge to have the right contract, so you have to migrate before test
  console.log("test start");
  it("should submit", function() {

    var aHelloWorldInstance;
    return HelloWorld.at("0xb31aea27e9cf5d5fa3140c3c33d3db75d1b0620b").then(function(instance) {
      aHelloWorldInstance = instance;
      console.log(instance);
      return aHelloWorldInstance.registerEcho();
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
