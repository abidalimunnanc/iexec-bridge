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
return IexecOracle.at("0x86cf94eb21369b5d427c3d082dd7c2c120a6e8c8")
      .then(instance => {
        aIexecOracleInstance = instance;
return aIexecOracleInstance.getWorkStderr.call('0xb3e270ede4dc9be8893a03192598b285d31d60a5','0x26a1d037737f3e9b9d8ddc0242032fee5036f275',"36206ed6-e885-4acb-8775-4b5ad301f640");
      }).then(getWorkStderrCall => {
          console.log("BEGIN_LOG");
          console.log("stderr:"+getWorkStderrCall);
          console.log("END_LOG");
      });
  });
});
