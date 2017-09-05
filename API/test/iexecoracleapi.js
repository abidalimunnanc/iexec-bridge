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

  var creator, bridge, user, provider;
  var amountGazProvided = 4000000;
  let isTestRPC;

  IexecOracle.Status = {
    UNSET: 0,
    UNAVAILABLE: 1,
    PENDING: 2,
    RUNNING: 3,
    COMPLETED: 4,
    ERROR: 5
  };

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

  describe("Test IexecOracle on IexecOracle well initialized", function() {
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
          provider = aIexecOracleAPI.address;
        });
    });

    it("Test Launch Event when call iexecRegister", function() {
      return aIexecOracleAPI.iexecRegister("ls", {
          from: user,
          gas: amountGazProvided
        })
        .then(txMined => {
          assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
          Extensions.assertEvent(aIexecOracleInstance, {
            event: "Launch",
            logIndex: 0,
            args: {
              user: user,
              provider: provider,
              creator: creator,
              functionName: "register",
              param1: "ls",
              param2: "",
              uid: ""
            }
          });
        });
    });
  });


  describe("Test Register function call then simulate bridge response", function() {

    var aIexecOracleInstance;
    var aIexecOracleAPI;
    beforeEach("create a new contract instance and call register ls", function() {
      return IexecOracle.new({
          from: bridge
        })
        .then(instance => {
          aIexecOracleInstance = instance;
          return IexecOracleAPI.new(aIexecOracleInstance.address, {
            from: creator,
            gas: amountGazProvided
          });
        }).
      then(instance => {
          aIexecOracleAPI = instance;
          provider = aIexecOracleAPI.address;
          return aIexecOracleAPI.iexecRegister("ls", {
            from: user,
            gas: amountGazProvided
          });
        })
        .then(txMined => {
          assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
        });
    });

    it("Only bridge can call registerCallback fonction", function() {
      return Extensions.expectedExceptionPromise(() => {
          return aIexecOracleInstance.registerCallback(user, provider, "ls", "1234", "", {
            from: user,
            gas: amountGazProvided
          });
        },
        amountGazProvided);
    });

    it("Simulate bridge response OK and test event Register", function() {
      //simulate bridge response
      let previousBlockTime;
      let workTimestamp;
      let nextBlockTime;
      return Extensions.getCurrentBlockTime()
        .then(now => {
          previousBlockTime = now;
          return aIexecOracleInstance.registerCallback(user, provider, "ls", "1234", "", {
            from: bridge,
            gas: amountGazProvided
          });
        })
        .then(txMined => {
          assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
          assert.strictEqual(txMined.logs[0].event, "CallbackEvent", "event");
          assert.strictEqual(txMined.logs[0].args.callbackType, "RegisterCallback", "callbackType");
          assert.strictEqual(txMined.logs[0].args.user, user, "user");
          assert.strictEqual(txMined.logs[0].args.creator, creator, "creator");
          assert.strictEqual(txMined.logs[0].args.provider, provider, "provider");
          assert.strictEqual(txMined.logs[0].args.uid, "1234", "uid");
          //assert.strictEqual(txMined.logs[0].args.timestamp, "time");
          assert.strictEqual(txMined.logs[0].args.status.toNumber(), IexecOracle.Status.UNAVAILABLE, "status");
          assert.strictEqual(txMined.logs[0].args.errorMsg, "", "errorMsg");
          return Promise.all([
            aIexecOracleInstance.getWork.call(user, provider, txMined.logs[0].args.uid),
            Extensions.getCurrentBlockTime()
          ]);
        })
        .then(workAndNow => {
          [name, timestamp, status, stdout, stderr] = workAndNow[0];
          nextBlockTime = workAndNow[1];
          assert.strictEqual(name, "ls", "work name");
          workTimestamp = timestamp.toNumber();
          assert.isAtLeast(workTimestamp, previousBlockTime, "work timestamp >= previousBlockTime");
          assert.isAtLeast(nextBlockTime, workTimestamp, "work timestamp <= nextBlockTime");
          assert.strictEqual(status.toNumber(), IexecOracle.Status.UNAVAILABLE, "work status");
          assert.strictEqual(stdout, "", "work stdout");
          assert.strictEqual(stderr, "", "work stderr");
        });
    });

    it("Simulate bridge response KO and test event Register", function() {
      let previousBlockTime;
      let workTimestamp;
      let nextBlockTime;
      //simulate bridge response
      return Extensions.getCurrentBlockTime()
        .then(now => {
          previousBlockTime = now;
          return aIexecOracleInstance.registerCallback(user, provider, "ls", "1234", "bridge crash", {
            from: bridge,
            gas: amountGazProvided
          });
        })
        .then(txMined => {
          assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
          assert.strictEqual(txMined.logs[0].event, "CallbackEvent", "event");
          assert.strictEqual(txMined.logs[0].args.callbackType, "RegisterCallback", "callbackType");
          assert.strictEqual(txMined.logs[0].args.provider, provider, "provider");
          assert.strictEqual(txMined.logs[0].args.creator, creator, "creator");
          assert.strictEqual(txMined.logs[0].args.user, user, "user");
          assert.strictEqual(txMined.logs[0].args.uid, "1234", "uid");
          assert.strictEqual(txMined.logs[0].args.status.toNumber(), IexecOracle.Status.ERROR, "status");
          assert.strictEqual(txMined.logs[0].args.errorMsg, "bridge crash", "errorMsg");
          return Promise.all([
            aIexecOracleInstance.getWork.call(user, provider, txMined.logs[0].args.uid),
            Extensions.getCurrentBlockTime()
          ]);
        })
        .then(workAndNow => {
          [name, timestamp, status, stdout, stderr] = workAndNow[0];
          nextBlockTime = workAndNow[1];
          assert.strictEqual(name, "ls", "work name");
          workTimestamp = timestamp.toNumber();
          assert.isAtLeast(workTimestamp, previousBlockTime, "work timestamp >= previousBlockTime");
          assert.isAtLeast(nextBlockTime, workTimestamp, "work timestamp <= nextBlockTime");
          assert.strictEqual(status.toNumber(), IexecOracle.Status.ERROR, "work status");
          assert.strictEqual(stdout, "", "work stdout");
          assert.strictEqual(stderr, "bridge crash", "work stderr");
        });
    });


    it("Simulate bridge registerCallback and test event Register, then next registerCallback call do not generate event Register", function() {
      //simulate bridge response
      return aIexecOracleInstance.registerCallback(user, provider, "ls", "1234", "", {
        from: bridge,
        gas: amountGazProvided
      }).then(txMined => {
        assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
        assert.strictEqual(txMined.logs[0].event, "CallbackEvent", "event");
        assert.strictEqual(txMined.logs[0].args.callbackType, "RegisterCallback", "callbackType");
        assert.strictEqual(txMined.logs[0].args.provider, provider, "provider");
        assert.strictEqual(txMined.logs[0].args.creator, creator, "creator");
        assert.strictEqual(txMined.logs[0].args.user, user, "user");
        assert.strictEqual(txMined.logs[0].args.uid, "1234", "uid");
        //assert.strictEqual(txMined.logs[0].args.timestamp, 0);
        assert.strictEqual(txMined.logs[0].args.status.toNumber(), IexecOracle.Status.UNAVAILABLE, "status");
        //call twice
        return aIexecOracleInstance.registerCallback(user, provider, "ls", "1234", "", {
          from: bridge,
          gas: amountGazProvided
        });
      }).then(txMined => {
        assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
        assert.strictEqual(txMined.logs.length, 0, "no Register event generate");
      });
    });
  });

  describe("Test IexecOracleAPI on IexecOracle well initialized", function() {
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
      return aIexecOracleInstance.getCreator.call(aIexecOracleAPI.address)
        .then(creatorStored => {
          assert.strictEqual(creator, creatorStored, "creator check");
        });
    });

    it("Test provider count for the creator  increment of by 1 in IexecOracle", function() {
      return aIexecOracleInstance.getCreatorProvidersCount.call(creator)
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

  // TODO test bridge call register ?
  // TODO limit register call
  // TODO test all stats counters
  //TODO test aIexecOracleAPI not initialized modifier only providerInitialized
});
