pragma solidity ^0.4.11;

import './SafeMath.sol';
import './IexecOracleAPI.sol';
import './IexecLib.sol';

contract IexecOracle {

    using SafeMath for uint;
    /*
     * EVENTS AND MODIFIERS
     */
    event Launch(address indexed user, address indexed provider, address indexed creator, string functionName, string param1, string param2, string workUid); // special log to launch process
    event CallbackEvent(string callbackType, address indexed user, address indexed provider, address indexed creator, string appName, string workUid, IexecLib.StatusEnum status, string errorMsg);

    modifier onlyBy(address a){
        if (msg.sender != a) throw;
        _;
    }

    address public bridge;

    struct Work {
      string name;
      uint256 timestamp;
      IexecLib.StatusEnum status;
      string stdout;
      string stderr;
    }
    // mapping (user => mapping(provider => mapping (workUid => Work))) workRegistry;
    mapping (address => mapping (address => mapping (string => Work))) workRegistry;
    //mapping (provider => creator)
    mapping (address => address ) creatorByProvider;

    //constructor
    function IexecOracle() {
        bridge = msg.sender;
    }

    function registerSmartContractAndCreator() {
        require(creatorByProvider[msg.sender] == 0x0);
        require(msg.sender != tx.origin);
        creatorByProvider[msg.sender]=tx.origin;
    }

    function getCreator(address provider) constant returns (address) {
        return creatorByProvider[provider];
    }

    function getWork(address user, address provider, string workUid) constant returns (string, uint256, IexecLib.StatusEnum, string, string) {
        return (
        workRegistry[user][provider][workUid].name,
        workRegistry[user][provider][workUid].timestamp,
        workRegistry[user][provider][workUid].status,
        workRegistry[user][provider][workUid].stdout,
        workRegistry[user][provider][workUid].stderr
        );
    }

    function getWorkName(address user, address provider, string workUid) constant returns (string) {
        return workRegistry[user][provider][workUid].name;
    }

    function getWorkTimestamp(address user, address provider, string workUid) constant returns (uint256) {
        return workRegistry[user][provider][workUid].timestamp;
    }

    function getWorkStatus(address user, address provider, string workUid) constant returns (IexecLib.StatusEnum) {
        return workRegistry[user][provider][workUid].status;
    }

    function getWorkStdout(address user, address provider, string workUid) constant returns (string) {
        return workRegistry[user][provider][workUid].stdout;
    }

    function getWorkStderr(address user, address provider, string workUid) constant returns (string) {
        return workRegistry[user][provider][workUid].stderr;
    }

    /*
     * LAUNCHER FUNCTIONS
     * These functions are launcher functions, the launch Event wich are called by the bridge,
     * and then the bridge call XTREMweb job, wait for result then modify the smart contract.
     */

    function submit(string appName, string param) {
        Launch(tx.origin, msg.sender,creatorByProvider[msg.sender], "submit", appName, param, "");
    }

    function status(string workUid) {
        Launch(tx.origin, msg.sender,creatorByProvider[msg.sender], "status", "", "", workUid);
    }

    function stdout(string workUid) {
        Launch(tx.origin, msg.sender, creatorByProvider[msg.sender], "stdout", "", "", workUid);
    }

    /*
     * ONLY BY BRIDGE
     * The following functions are called only by the bridge, to modify the state of the XWObject
     */
    function submitCallback(address user, address provider, string appName, string workUid, string errorMsg) onlyBy(bridge) {
        if (workRegistry[user][provider][workUid].status == IexecLib.StatusEnum.UNSET) {
            workRegistry[user][provider][workUid].name = appName;
            workRegistry[user][provider][workUid].timestamp=now;
            bytes memory errorMsgEmptyStringTest = bytes(errorMsg); // Uses memory
            if (errorMsgEmptyStringTest.length == 0) {
                workRegistry[user][provider][workUid].status = IexecLib.StatusEnum.PENDING;
            } else {
                workRegistry[user][provider][workUid].status = IexecLib.StatusEnum.ERROR;
                workRegistry[user][provider][workUid].stderr = errorMsg;
            }
            CallbackEvent("SubmitCallback",user, provider, creatorByProvider[provider], appName, workUid, workRegistry[user][provider][workUid].status, errorMsg);
            iexecCallback("SubmitCallback",user, provider, creatorByProvider[provider], appName, workUid, workRegistry[user][provider][workUid].status, errorMsg);
        }
    }

    function iexecCallback(string callbackType, address user, address provider, address creator, string appName, string workUid, IexecLib.StatusEnum status, string errorMsg) internal {
        IexecOracleAPI iexecOracleAPI = IexecOracleAPI(provider);
        iexecOracleAPI.iexecCallback(callbackType, user, provider, creatorByProvider[provider], appName, workUid, status,errorMsg);
    }


    function statusCallback(address user, address provider, string workUid, IexecLib.StatusEnum status, string errorMsg) onlyBy(bridge) {
        workRegistry[user][provider][workUid].timestamp=now;
        workRegistry[user][provider][workUid].status = status;
        bytes memory errorMsgEmptyStringTest = bytes(errorMsg); // Uses memory
         if (errorMsgEmptyStringTest.length != 0) {
            workRegistry[user][provider][workUid].status = IexecLib.StatusEnum.ERROR;
           workRegistry[user][provider][workUid].stderr = errorMsg;
        }
        CallbackEvent("StatusCallback",user, provider, creatorByProvider[provider], workRegistry[user][provider][workUid].name, workUid, workRegistry[user][provider][workUid].status, errorMsg);
        iexecCallback("StatusCallback",user, provider, creatorByProvider[provider], workRegistry[user][provider][workUid].name, workUid, workRegistry[user][provider][workUid].status, errorMsg);
    }

    function stdoutCallback(address user, address provider, string workUid, string stdout, string errorMsg) onlyBy(bridge) {
        workRegistry[user][provider][workUid].timestamp=now;
        workRegistry[user][provider][workUid].stdout=stdout;
        bytes memory errorMsgEmptyStringTest = bytes(errorMsg); // Uses memory
        if (errorMsgEmptyStringTest.length != 0) {
            workRegistry[user][provider][workUid].status = IexecLib.StatusEnum.ERROR;
            workRegistry[user][provider][workUid].stderr = errorMsg;
        }
        CallbackEvent("StdoutCallback",user, provider, creatorByProvider[provider], workRegistry[user][provider][workUid].name, workUid, workRegistry[user][provider][workUid].status, errorMsg);
        iexecCallback("StdoutCallback",user, provider, creatorByProvider[provider], workRegistry[user][provider][workUid].name, workUid, workRegistry[user][provider][workUid].status, errorMsg);
    }
}