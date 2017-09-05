pragma solidity ^0.4.11;

import './SafeMath.sol';

contract IexecOracle {

    using SafeMath for uint;
    /*
     * EVENTS AND MODIFIERS
     */
    event Launch(address indexed user, address indexed provider, address indexed creator, string functionName, string param1, string param2, string uid); // special log to launch process
    event Register(address indexed user, address indexed provider, address indexed creator, string appName, string uid, StatusEnum status, string errorMsg);

    modifier onlyBy(address a){
        if (msg.sender != a) throw;
        _;
    }

    address public bridge;

    enum StatusEnum {UNSET, UNAVAILABLE, PENDING, RUNNING, COMPLETED, ERROR}

    struct Work {
      string name;
      uint256 timestamp;
      StatusEnum status;
      string stdout;
      string stderr;
    }
    // mapping (user => mapping(provider => mapping (uid => Work))) workRegistry;
    mapping (address => mapping (address => mapping (string => Work))) workRegistry;
    //mapping (provider => creator)
    mapping (address => address ) creatorByProvider;

    // stats
    uint256 public providersCount;
    uint256 public usersCount;
    uint256 public worksCount;


    mapping (address => uint256 ) creatorProvidersCount;

    mapping (address => uint256 ) userWorksCount;

    mapping (address => uint256 ) userProvidersCount;

    //mapping (user => mapping (provider => UsageCount ))
    mapping (address => mapping (address => uint256 )) userProviderUsageCount;

    mapping (address => uint256 ) providerWorksCount;

    mapping (address => uint256 ) providerUsersCount;

    //mapping (provider => mapping (user => UsageCount ))
    mapping (address => mapping (address => uint256 )) providerUserUsageCount;

    mapping (address => uint256 ) creatorWorksCount;


    //constructor
    function IexecOracle() {
        bridge = msg.sender;
    }

    function registerSmartContractAndCreator() {
        require(creatorByProvider[msg.sender] == 0x0);
        require(msg.sender != tx.origin);
        creatorByProvider[msg.sender]=tx.origin;
        creatorProvidersCount[tx.origin]=creatorProvidersCount[tx.origin].add(1);
        providersCount=providersCount.add(1);
    }

    function getCreatorProvidersCount(address provider) constant returns (uint256) {
        return creatorProvidersCount[provider];
    }

    function getCreator(address provider) constant returns (address) {
        return creatorByProvider[provider];
    }

    function getWork(address user, address provider, string uid) constant returns (string, uint256, StatusEnum, string, string) {
        return (
        workRegistry[user][provider][uid].name,
        workRegistry[user][provider][uid].timestamp,
        workRegistry[user][provider][uid].status,
        workRegistry[user][provider][uid].stdout,
        workRegistry[user][provider][uid].stderr
        );
    }

    function getWorkName(address user, address provider, string uid) constant returns (string) {
        return workRegistry[user][provider][uid].name;
    }

    function getWorkTimestamp(address user, address provider, string uid) constant returns (uint256) {
        return workRegistry[user][provider][uid].timestamp;
    }

    function getWorkStatus(address user, address provider, string uid) constant returns (StatusEnum) {
        return workRegistry[user][provider][uid].status;
    }

    function getWorkStdout(address user, address provider, string uid) constant returns (string) {
        return workRegistry[user][provider][uid].stdout;
    }

    function getWorkStderr(address user, address provider, string uid) constant returns (string) {
        return workRegistry[user][provider][uid].stderr;
    }



    /*
     * LAUNCHER FUNCTIONS
     * These functions are launcher functions, the launch Event wich are called by the bridge,
     * and then the bridge call XTREMweb job, wait for result then modify the smart contract.
     */
    function register(string appName) {
        Launch(tx.origin, msg.sender, creatorByProvider[msg.sender],"register", appName, "", "");
    }

    function submit(string appName, string param) {// param = commandline
        Launch(tx.origin, msg.sender,creatorByProvider[msg.sender], "submit", param, "", "");
    }

    function submitAndWait(string appName, string param, string pattern) {
        Launch(tx.origin, msg.sender,creatorByProvider[msg.sender], "submitAndWait", pattern, "", "");
    }

    function setParam(string uid, string paramName, string paramValue) {
        Launch(tx.origin, msg.sender,creatorByProvider[msg.sender], "setParam", paramName, paramValue, uid);
    }

    function setPending(string uid) {
        Launch(tx.origin, msg.sender,creatorByProvider[msg.sender], "setParam", "status", "pending", uid);
    }

    function status(string uid) {
        Launch(tx.origin, msg.sender,creatorByProvider[msg.sender], "status", "", "", uid);
    }

    function result(string uid) {
        Launch(tx.origin, msg.sender, creatorByProvider[msg.sender],"result", "", "", uid);
    }

    function stdout(string uid) {
        Launch(tx.origin, msg.sender, creatorByProvider[msg.sender], "stdout", "", "", uid);
    }

    function toDelete(string uid) {
        Launch(tx.origin, msg.sender, creatorByProvider[msg.sender], "toDelete", "", "", uid);
    }

    function waitResult(string uid, string pattern) {
        Launch(tx.origin, msg.sender, creatorByProvider[msg.sender], "waitResult", pattern, "", uid);
    }

    /*
     * ONLY BY BRIDGE
     * The following functions are called only by the bridge, to modify the state of the XWObject
     */
    function registerCallback(address user, address provider, string appName, string uid, string errorMsg) onlyBy(bridge) {
        if (workRegistry[user][provider][uid].status == StatusEnum.UNSET) {
            workRegistry[user][provider][uid].name = appName;
            workRegistry[user][provider][uid].timestamp=now;
            bytes memory errorMsgEmptyStringTest = bytes(errorMsg); // Uses memory
            if (errorMsgEmptyStringTest.length == 0) {
              workRegistry[user][provider][uid].status = StatusEnum.UNAVAILABLE;
            } else {
              workRegistry[user][provider][uid].status = StatusEnum.ERROR;
              workRegistry[user][provider][uid].stderr = errorMsg;
            }

            // TODO test all stats counters
            //increment stats
            worksCount=worksCount.add(1);
            if (userWorksCount[user] == 0x0) {
              //new user, increment users count
              usersCount=usersCount.add(1);
            }
            userWorksCount[user]=userWorksCount[user].add(1);
            providerWorksCount[provider]=providerWorksCount[provider].add(1);

            if (providerUserUsageCount[provider][user] == 0x0) {
              //new user for this provider
              providerUsersCount[provider]=providerUsersCount[provider].add(1);
            }
            providerUserUsageCount[provider][user]=providerUserUsageCount[provider][user].add(1);

            if (  userProviderUsageCount[user][provider]== 0x0) {
              //new provider used by this user
              userProvidersCount[user]=userProvidersCount[user].add(1);
            }
            userProviderUsageCount[user][provider]=userProviderUsageCount[user][provider].add(1);

            creatorWorksCount[creatorByProvider[provider]]=creatorWorksCount[creatorByProvider[provider]].add(1);

            Register(user, provider, creatorByProvider[provider], appName, uid, workRegistry[user][provider][uid].status, errorMsg);
        }
    }
}
