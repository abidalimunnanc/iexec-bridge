pragma solidity ^0.4.11;


contract XtremWebInterface {

    address public bridge;

    enum StatusEnum {UNSET, UNAVAILABLE, PENDING, RUNNING, COMPLETED, ERROR}

    /*
     * EVENTS AND MODIFIERS
     */
    event Launch(address indexed user, address indexed owner, string functionName, string param1, string param2, string param3, string uid); // special log to launch process
    event Register(address indexed user, address indexed owner, string appName, string uid, StatusEnum status, string errorMsg);

    modifier onlyBy(address a){
        if (msg.sender != a) throw;
        _;
    }

    /*
     * XWObject aims is to reproduce XWEB Object in solidity
     */
    struct XWObject {
      string name;
      uint256 timestamp;
      StatusEnum status;
      string stdout;
      string stderr;
    }
    // mapping (user => mapping(owner => mapping (uid => XWObject))) workRegisteries;
    mapping (address => mapping (address => mapping (string => XWObject))) workRegisteries;

    //constructor
    function XtremWebInterface() {
        bridge = msg.sender;
    }


    function getWork(address user, address owner, string uid) constant returns (string, uint256, StatusEnum, string, string) {
        return (
        workRegisteries[user][owner][uid].name,
        workRegisteries[user][owner][uid].timestamp,
        workRegisteries[user][owner][uid].status,
        workRegisteries[user][owner][uid].stdout,
        workRegisteries[user][owner][uid].stderr
        );
    }

    function getWorkName(address user, address owner, string uid) constant returns (string) {
        return workRegisteries[user][owner][uid].name;
    }

    function getWorkTimestamp(address user, address owner, string uid) constant returns (uint256) {
        return workRegisteries[user][owner][uid].timestamp;
    }

    function getWorkStatus(address user, address owner, string uid) constant returns (StatusEnum) {
        return workRegisteries[user][owner][uid].status;
    }

    function getWorkStdout(address user, address owner, string uid) constant returns (string) {
        return workRegisteries[user][owner][uid].stdout;
    }

    function getWorkStderr(address user, address owner, string uid) constant returns (string) {
        return workRegisteries[user][owner][uid].stderr;
    }



    /*
     * LAUNCHER FUNCTIONS
     * These functions are launcher functions, the launch Event wich are called by the bridge,
     * and then the bridge call XTREMweb job, wait for result then modify the smart contract.
     */
    function register(string appName) {
        Launch(tx.origin, msg.sender, "register", appName, "", "", "");
    }

    function submit(string appName, string param) {// param = commandline
        Launch(tx.origin, msg.sender, "submit", param, "", "", "");
    }

    function submitAndWait(string appName, string param, string pattern) {
        Launch(tx.origin, msg.sender, "submitAndWait", pattern, "", "", "");
    }

    function setParam(string uid, string paramName, string paramValue) {
        Launch(tx.origin, msg.sender, "setParam", paramName, paramValue, "", uid);
    }

    function setPending(string uid) {
        Launch(tx.origin, msg.sender, "setParam", "status", "pending", "", uid);
    }

    function status(string uid) {
        Launch(tx.origin, msg.sender, "status", "", "", "", uid);
    }

    function result(string uid) {
        Launch(tx.origin, msg.sender, "result", "", "", "", uid);
    }

    function stdout(string uid) {
        Launch(tx.origin, msg.sender, "stdout", "", "", "", uid);
    }

    function toDelete(string uid) {
        Launch(tx.origin, msg.sender, "toDelete", "", "", "", uid);
    }

    function waitResult(string uid, string pattern) {
        Launch(tx.origin, msg.sender, "waitResult", pattern, "", "", uid);
    }

    /*
     * ONLY BY BRIDGE
     * The following functions are called only by the bridge, to modify the state of the XWObject
     */
    function registerCallback(address user, address owner, string appName, string uid, string errorMsg) onlyBy(bridge) {
        if (workRegisteries[user][owner][uid].status == StatusEnum.UNSET) {
            workRegisteries[user][owner][uid].name = appName;
            workRegisteries[user][owner][uid].timestamp=now;
            bytes memory errorMsgEmptyStringTest = bytes(errorMsg); // Uses memory
            if (errorMsgEmptyStringTest.length == 0) {
              workRegisteries[user][owner][uid].status = StatusEnum.UNAVAILABLE;
            } else {
              workRegisteries[user][owner][uid].status = StatusEnum.ERROR;
              workRegisteries[user][owner][uid].stderr = errorMsg;
            }
            Register(user, owner, appName, uid, workRegisteries[user][owner][uid].status, errorMsg);
        }
    }
}
