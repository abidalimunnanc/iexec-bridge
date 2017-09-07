var HelloWorld = artifacts.require("./HelloWorld");
contract('HelloWorld', function(accounts) {
  // need the bridge to have the right contract, so you have to migrate before test
  console.log("test start");
  it("should submit", function() {

    var aHelloWorldInstance;
    return HelloWorld.at("0x6d43c83d9d843d5a9de34db164dc33a093a6812e").then(function(instance) {
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
