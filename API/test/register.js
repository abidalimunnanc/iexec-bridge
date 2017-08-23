var XtremWebInterface = artifacts.require("./XtremWebInterface.sol");
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


contract('XtremWebInterface', function(accounts) {

  var owner, bridge, user;
  var amountGazProvided = 3000000;
  let isTestRPC;

  XtremWebInterface.Status = {
    UNSET: 0,
    UNAVAILABLE: 1,
    PENDING: 2,
    RUNNING: 3,
    COMPLETED: 4,
    ERROR: 5
  };

  before("should prepare accounts and check TestRPC Mode", function() {
    assert.isAtLeast(accounts.length, 4, "should have at least 4 accounts");
    owner = accounts[0];
    bridge = accounts[1];
    user = accounts[2];
    return Extensions.makeSureAreUnlocked(
        [owner, bridge, user])
      .then(() => web3.eth.getBalancePromise(owner))
      .then(balance => assert.isTrue(
        web3.toWei(web3.toBigNumber(90), "ether").lessThan(balance),
        "owner should have at least 35 ether, not " + web3.fromWei(balance, "ether")))
      .then(() => Extensions.refillAccount(owner, user, 30))
      .then(() => Extensions.refillAccount(owner, bridge, 30))
      .then(() => web3.version.getNodePromise())
      .then(node => isTestRPC = node.indexOf("EthereumJS TestRPC") >= 0);
  });


  describe("Test Register function call", function() {

    var aXtremWebInterfaceInstance;

    beforeEach("create a new contract instance", function() {
      return XtremWebInterface.new({
          from: bridge,
          gas: amountGazProvided
        })
        .then(instance => {
          aXtremWebInterfaceInstance = instance;
        });
    });

    it("Test register function and check event Launch", function() {
      return aXtremWebInterfaceInstance.register("ls", {
          from: user,
          gas: amountGazProvided
        })
        .then(txMined => {
          assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
          assert.strictEqual(txMined.logs[0].event, "Launch", "event");
          assert.strictEqual(txMined.logs[0].args.owner, user, "owner");
          assert.strictEqual(txMined.logs[0].args.user, user, "user");
          assert.strictEqual(txMined.logs[0].args.functionName, "register", "functionName");
          assert.strictEqual(txMined.logs[0].args.param1, "ls", "param1");
          assert.strictEqual(txMined.logs[0].args.param2, "", "param2");
          assert.strictEqual(txMined.logs[0].args.param3, "", "param3");
          assert.strictEqual(txMined.logs[0].args.uid.toNumber(), 0, "uid");
        });
    });
  });


  describe("Test Register function call then simulate bridge response", function() {

    var aXtremWebInterfaceInstance;

    beforeEach("create a new contract instance", function() {
      return XtremWebInterface.new({
          from: bridge
        })
        .then(instance => {
          aXtremWebInterfaceInstance = instance;
          return aXtremWebInterfaceInstance.register("ls", {
            from: user,
            gas: amountGazProvided
          });
        })
        .then(txMined => {
          assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
          assert.strictEqual(txMined.logs[0].event, "Launch", "event");
          assert.strictEqual(txMined.logs[0].args.owner, user, "owner");
          assert.strictEqual(txMined.logs[0].args.user, user, "user");
          assert.strictEqual(txMined.logs[0].args.functionName, "register", "functionName");
          assert.strictEqual(txMined.logs[0].args.param1, "ls", "param1");
          assert.strictEqual(txMined.logs[0].args.param2, "", "param2");
          assert.strictEqual(txMined.logs[0].args.param3, "", "param3");
          assert.strictEqual(txMined.logs[0].args.uid.toNumber(), 0, "uid");
        });
    });

    it("Simulate bridge response OK and test event Register", function() {
      //simulate bridge response
      let previousBlockTime;
      let workTimestamp;
      let nextBlockTime;
      return Extensions.getCurrentBlockTime()
        .then(now => {
          previousBlockTime = now;
          return aXtremWebInterfaceInstance.registerCallback(user, owner, "ls", 1234, "", {
            from: bridge,
            gas: amountGazProvided
          });
        })
        .then(txMined => {
          assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
          assert.strictEqual(txMined.logs[0].event, "Register", "event");
          assert.strictEqual(txMined.logs[0].args.user, user, "user");
          assert.strictEqual(txMined.logs[0].args.owner, owner, "owner");
          assert.strictEqual(txMined.logs[0].args.uid.toNumber(), 1234, "uid");
          //assert.strictEqual(txMined.logs[0].args.timestamp, "time");
          assert.strictEqual(txMined.logs[0].args.status.toNumber(), XtremWebInterface.Status.UNAVAILABLE, "status");
          assert.strictEqual(txMined.logs[0].args.errorMsg, "", "errorMsg");
          return Promise.all([
            aXtremWebInterfaceInstance.getWork(user, owner, txMined.logs[0].args.uid.toNumber()),
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
          assert.strictEqual(status.toNumber(), XtremWebInterface.Status.UNAVAILABLE, "work status");
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
          return aXtremWebInterfaceInstance.registerCallback(user, owner, "ls", 1234, "bridge crash", {
            from: bridge,
            gas: amountGazProvided
          });
        })
        .then(txMined => {
          assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
          assert.strictEqual(txMined.logs[0].event, "Register", "event");
          assert.strictEqual(txMined.logs[0].args.owner, owner, "owner");
          assert.strictEqual(txMined.logs[0].args.user, user, "user");
          assert.strictEqual(txMined.logs[0].args.uid.toNumber(), 1234, "uid");
          assert.strictEqual(txMined.logs[0].args.status.toNumber(), XtremWebInterface.Status.ERROR, "status");
          assert.strictEqual(txMined.logs[0].args.errorMsg, "bridge crash", "errorMsg");
          return Promise.all([
            aXtremWebInterfaceInstance.getWork(user, owner, txMined.logs[0].args.uid.toNumber()),
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
          assert.strictEqual(status.toNumber(), XtremWebInterface.Status.ERROR, "work status");
          assert.strictEqual(stdout, "", "work stdout");
          assert.strictEqual(stderr, "bridge crash", "work stderr");
        });

    });

    it("Only bridge can call registerCallback fonction", function() {
      return Extensions.expectedExceptionPromise(function() {
          return aXtremWebInterfaceInstance.registerCallback(user, owner, "ls", 1234, "", {
            from: user,
            gas: amountGazProvided
          });
        },
        amountGazProvided);
    });

    it("Simulate bridge registerCallback and test event Register, then next registerCallback call do not generate event Register", function() {
      //simulate bridge response
      return aXtremWebInterfaceInstance.registerCallback(user, owner, "ls", 1234, "", {
        from: bridge,
        gas: amountGazProvided
      }).then(txMined => {
        assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
        assert.strictEqual(txMined.logs[0].event, "Register", "event");
        assert.strictEqual(txMined.logs[0].args.owner, owner, "owner");
        assert.strictEqual(txMined.logs[0].args.user, user, "user");
        assert.strictEqual(txMined.logs[0].args.uid.toNumber(), 1234, "uid");
        //assert.strictEqual(txMined.logs[0].args.timestamp, 0);
        assert.strictEqual(txMined.logs[0].args.status.toNumber(), XtremWebInterface.Status.UNAVAILABLE, "status");
        return aXtremWebInterfaceInstance.registerCallback(user, owner, "ls", 1234, "", {
          from: bridge,
          gas: amountGazProvided
        });
      }).then(txMined => {
        assert.isBelow(txMined.receipt.gasUsed, amountGazProvided, "should not use all gas");
        assert.strictEqual(txMined.logs.length, 0, "no Register event generate");
      });
    });
  });

  // TODO test bridge call register ?
  // TODO limit register call


});
