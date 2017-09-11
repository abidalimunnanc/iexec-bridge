var HelloWorld = artifacts.require("./HelloWorld");

const Promise = require("bluebird");
//extensions.js : credit to : https://github.com/coldice/dbh-b9lab-hackathon/blob/development/truffle/utils/extensions.js
const Extensions = require("../../utils/extensions.js");
const addEvmFunctions = require("../../utils/evmFunctions.js");
addEvmFunctions(web3);
Promise.promisifyAll(web3.eth, {
  suffix: "Promise"
});
Promise.promisifyAll(web3.version, {
  suffix: "Promise"
});
Promise.promisifyAll(web3.evm, {
  suffix: "Promise"
});
Extensions.init(web3, assert);


contract('IexecOracle', function(accounts) {

  var creator, bridge, user, provider;
  var amountGazProvided = 4000000;
  let isTestRPC;

  before("should prepare accounts and check TestRPC Mode", function() {
    assert.isAtLeast(accounts.length, 4, "should have at least 4 accounts");
    creator = accounts[0];
    bridge = accounts[1];
    user = accounts[2];

    return Extensions.makeSureAreUnlocked(
        [creator, bridge, user])
      .then(() => web3.eth.getBalancePromise(creator))
      .then(balance => assert.isTrue(
        web3.toWei(web3.toBigNumber(50), "ether").lessThan(balance),
        "creator should have at least 80 ether, not " + web3.fromWei(balance, "ether")))
      .then(() => web3.version.getNodePromise())
      .then(node => isTestRPC = node.indexOf("EthereumJS TestRPC") >= 0);
  });


  it("watch CallbackEvent", function() {
    var aHelloWorldInstance;
return HelloWorld.at("0x67db72da8d8a03683a3586ff41abc90f3d88ecc3")
      .then(instance => {
        aHelloWorldInstance = instance;
        return Extensions.getEventsPromise(aHelloWorldInstance.IexecCallbackEvent({}, {
          fromBlock: 0,
          toBlock: "latest"
        }));
      }).then(events => {
          console.log("BEGIN_LOG");
          console.log(events);
          console.log("END_LOG");
      });
  });
});
