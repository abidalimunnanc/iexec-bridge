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
        web3.toWei(web3.toBigNumber(90), "ether").lessThan(balance),
        "creator should have at least 35 ether, not " + web3.fromWei(balance, "ether")))
      .then(() => Extensions.refillAccount(creator, user, 30))
      .then(() => Extensions.refillAccount(creator, bridge, 30))
      .then(() => web3.version.getNodePromise())
      .then(node => isTestRPC = node.indexOf("EthereumJS TestRPC") >= 0);
  });


  it("get a work", function() {
    var aIexecOracleInstance;
return IexecOracle.at("PUT_ADDRESS_HERE")
      .then(instance => {
        aIexecOracleInstance = instance;
        return aIexecOracleInstance.getWork.call();
      }).then(getWorkCall => {
          console.log("BEGIN_LOG");
          console.log(getWorkCall);
          console.log("END_LOG");
      });
  });
});
