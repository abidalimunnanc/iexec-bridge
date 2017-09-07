var IexecOracle = artifacts.require("./IexecOracle.sol");

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
      .then(() => Extensions.refillAccount(creator, user, 10))
      .then(() => Extensions.refillAccount(creator, bridge, 10))
      .then(() => web3.version.getNodePromise())
      .then(node => isTestRPC = node.indexOf("EthereumJS TestRPC") >= 0);
  });


  it("get a work", function() {
    var aIexecOracleInstance;
return IexecOracle.at("0x95df6b6770117cc76d7c70ad1f724283ca371f5c")
      .then(instance => {
        aIexecOracleInstance = instance;
return aIexecOracleInstance.getWorkTimestamp.call('0x03bea8f9cd0e2cc66b815b1e199c1b33843d5e6e','0xa54609d7a1827404a85e820f9109c78802940289',"01be5365-b950-4c04-9dbd-ec8bb218724f");
      }).then(getWorkTimestampCall => {
          console.log("BEGIN_LOG");
          console.log("timestamp:"+getWorkTimestampCall);
          console.log("END_LOG");
      });
  });
});
