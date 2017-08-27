var IexecOracle = artifacts.require("./IexecOracle.sol");
var IexecOracleAPI = artifacts.require("./IexecOracleAPI.sol");

const Promise = require("bluebird");
//extensions.js : credit to : https://github.com/coldice/dbh-b9lab-hackathon/blob/development/truffle/utils/extensions.js
const Extensions = require("../utils/extensions.js");
const addEvmFunctions = require("../utils/evmFunctions.js");
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


contract('IexecOracleAPI', function(accounts) {

      var creator, bridge, user;
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

      it("Test call registerSmartContractAndCreator with tx.origin = msg.sender", function() {
        return IexecOracle.new({
            from: bridge,
            gas: amountGazProvided
          })
          .then(instance => {
            aIexecOracleInstance = instance;
            return Extensions.expectedExceptionPromise(() => {
                return aIexecOracleInstance.registerSmartContractAndCreator({
                  from: creator,
                  gas: amountGazProvided
                });
              },
              amountGazProvided);
          });
      });

      describe("Test IexecOracleAPI", function() {
          var aIexecOracleInstance;
          var aIexecOracleAPI;
          beforeEach("create a new contract instance", function() {
            return IexecOracle.new({
                from: bridge,
                gas: amountGazProvided
              })
              .then(instance => {
                aIexecOracleInstance = instance;
                return IexecOracleAPI.new(aIexecOracleInstance.address, {
                  from: creator,
                  gas: amountGazProvided
                });
              }).then(instance => {
                aIexecOracleAPI = instance;
              });
          });

          it("Test creator and creator of IexecOracleAPI are set correctly in IexecOracle", function() {
            return aIexecOracleInstance.getCreator(aIexecOracleAPI.address)
              .then(creatorStored => {
                assert.strictEqual(creator, creatorStored, "creator check");
              });
          });

          it("Test provider count for the creator  increment of by 1 in IexecOracle", function() {
              return aIexecOracleInstance.getCreatorProvidersCount(creator)
                .then(count => {
                    assert.strictEqual(1, count.toNumber(), "creatorProvidersCount increment by 1");
                    });
                });

            it("Cannot change creator in aIexecOracleInstance after first call by IexecOracleAPI constructor", function() {
              return Extensions.expectedExceptionPromise(() => {
                  return aIexecOracleAPI.impossible(aIexecOracleInstance.address, {
                    from: user,
                    gas: amountGazProvided
                  });
                },
                amountGazProvided);
            });
          });
      });
