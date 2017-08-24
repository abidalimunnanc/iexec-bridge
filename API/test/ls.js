var IexecWorksGateway = artifacts.require("./IexecWorksGateway.sol");
var LS = artifacts.require("./LS.sol");
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


contract('LS', function(accounts) {

  var provider, bridge, user;
  var amountGazProvided = 3000000;
  let isTestRPC;

  IexecWorksGateway.Status = {
    UNSET: 0,
    UNAVAILABLE: 1,
    PENDING: 2,
    RUNNING: 3,
    COMPLETED: 4,
    ERROR: 5
  };

  before("should prepare accounts and check TestRPC Mode", function() {
    assert.isAtLeast(accounts.length, 4, "should have at least 4 accounts");
    provider = accounts[0];
    bridge = accounts[1];
    user = accounts[2];
    return Extensions.makeSureAreUnlocked(
        [provider, bridge, user])
      .then(() => web3.eth.getBalancePromise(provider))
      .then(balance => assert.isTrue(
        web3.toWei(web3.toBigNumber(90), "ether").lessThan(balance),
        "provider should have at least 35 ether, not " + web3.fromWei(balance, "ether")))
      .then(() => Extensions.refillAccount(provider, user, 30))
      .then(() => Extensions.refillAccount(provider, bridge, 30))
      .then(() => web3.version.getNodePromise())
      .then(node => isTestRPC = node.indexOf("EthereumJS TestRPC") >= 0);
  });


  describe("Test Register function call", function() {
    var aIexecWorksGatewayInstance;
    var aLSInstance;
    beforeEach("create a new contract instance", function() {
      return IexecWorksGateway.new({
          from: bridge,
          gas: amountGazProvided
        })
        .then(instance => {
          aIexecWorksGatewayInstance = instance;
          return LS.new(aIexecWorksGatewayInstance.address, {
            from: provider,
            gas: amountGazProvided
          });
        }).then(instance => {
          aLSInstance = instance;
        });
    });

    it("Test iexecLS function and simulate bridge callback", function() {
      let currentBlockNumber;
      return web3.eth.getBlockNumberPromise()
        .then(blockNumber => {
          currentBlockNumber = blockNumber;
          return aLSInstance.iexecLS({
            from: user,
            gas: amountGazProvided
          });
        })
        .then(txMined => {
          assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
          return Extensions.getEventsPromise(
            aIexecWorksGatewayInstance.Launch({}, {
              fromBlock: currentBlockNumber,
              toBlock: "latest"
            }));
        })
        .then(events => {
          assert.strictEqual(events[0].event, "Launch");
          assert.strictEqual(events[0].args.user, user, "user"); //tx.origin
          assert.strictEqual(events[0].args.provider, aLSInstance.address, "provider"); //msg.sender
          assert.strictEqual(events[0].args.functionName, "register", "functionName");
          assert.strictEqual(events[0].args.param1, "ls", "param1");
          assert.strictEqual(events[0].args.param2, "", "param2");
          assert.strictEqual(events[0].args.param3, "", "param3");
          assert.strictEqual(events[0].args.uid, "", "uid");
          //Simulate bridge response and test event Register
          return aIexecWorksGatewayInstance.registerCallback(user, aLSInstance.address, "ls", "1234", "", {
            from: bridge,
            gas: amountGazProvided
          });
        })
        .then(txMined => {
          assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
          assert.strictEqual(txMined.logs[0].event, "Register", "event");
          assert.strictEqual(txMined.logs[0].args.user, user, "user");
          assert.strictEqual(txMined.logs[0].args.provider, aLSInstance.address, "provider");
          assert.strictEqual(txMined.logs[0].args.uid, "1234", "uid");
          assert.strictEqual(txMined.logs[0].args.status.toNumber(), IexecWorksGateway.Status.UNAVAILABLE, "status");
        });
    });
  });
});
