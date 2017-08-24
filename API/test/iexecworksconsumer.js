var IexecWorksGateway = artifacts.require("./IexecWorksGateway.sol");
var IexecWorksConsumer = artifacts.require("./IexecWorksConsumer.sol");

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


contract('IexecWorksConsumer', function(accounts) {

  var creator, bridge, user;
  var amountGazProvided = 3000000;
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

  it("Test call registerConsumerSmartContract with tx.origin = msg.sender", function() {
    return IexecWorksGateway.new({
        from: bridge,
        gas: amountGazProvided
      })
      .then(instance => {
        aIexecWorksGatewayInstance = instance;
        return Extensions.expectedExceptionPromise(() => {
            return aIexecWorksGatewayInstance.registerConsumerSmartContract({
              from: creator,
              gas: amountGazProvided
            });
          },
          amountGazProvided);
      });
  });

  describe("Test IexecWorksConsumer", function() {
    var aIexecWorksGatewayInstance;
    var aIexecWorksConsumer;
    beforeEach("create a new contract instance", function() {
      return IexecWorksGateway.new({
          from: bridge,
          gas: amountGazProvided
        })
        .then(instance => {
          aIexecWorksGatewayInstance = instance;
          return IexecWorksConsumer.new(aIexecWorksGatewayInstance.address, {
            from: creator,
            gas: amountGazProvided
          });
        }).then(instance => {
          aIexecWorksConsumer = instance;
        });
    });

    it("Test creator and creator of IexecWorksConsumer are set correctly in IexecWorksGateway", function() {
      return aIexecWorksGatewayInstance.getCreator(aIexecWorksConsumer.address)
        .then(creatorStored => {
          assert.strictEqual(creator, creatorStored, "creator check");
        });
    });

    it("Cannot change creator in aIexecWorksGatewayInstance after first call by IexecWorksConsumer constructor", function() {
      return Extensions.expectedExceptionPromise(() => {
          return aIexecWorksConsumer.impossible(aIexecWorksGatewayInstance.address, {
            from: user,
            gas: amountGazProvided
          });
        },
        amountGazProvided);
    });
  });
});
