pragma solidity ^0.4.11;

contract XtremWebInterface {

    address public bridge;
    enum Status {Completed, Pending, Running, Waiting, Error}
    struct XWObject {
  		string name;        // application name
  		string timestamp;
  		Status status;
  		string stdout;
  		string pattern;
        // param[] params;
	  }
	  mapping (address => mapping (uint => XWObject)) workRegisteries;
    mapping (string => string) param;
    /*
     * XWObject aims is to reproduce XWEB Object in solidity
     */
    function XtremWebInterface () {
        bridge = msg.sender;
    }

    /*
     * LAUNCHER FUNCTIONS
     * These functions are launcher functions, the launch Event wich are called by the bridge,
     * and then the bridge call XTREMweb job, wait for result then modify the smart contract.
     */
		function register(string appName) {
        Launch(msg.sender,"register", appName, "", "", 0);
		}
		function submit(string appName, string param) { 		// param = commandline
        Launch(msg.sender,"submit", param, "", "", 0);
		}
		function submitAndWait(string appName, string param, string pattern) {
		    Launch(msg.sender,"submitAndWait", pattern, "", "", 0);
		}
		function setParam(uint UID, string paramName, string paramValue) {
		    Launch(msg.sender,"setParam", paramName, paramValue, "", UID);
		}
		function setPending(uint UID) {
		    Launch(msg.sender,"setParam", "status", "pending", "",UID);
		}
		function status(uint UID) {
		    Launch(msg.sender,"status", "", "", "", UID);
		}
		function result(uint UID) {
		    Launch(msg.sender,"result", "", "", "", UID);
		}
		function stdout(uint UID) {
		    Launch(msg.sender,"stdout", "", "", "", UID);
		}
		function toDelete(uint UID) {
		    Launch(msg.sender,"toDelete", "", "", "", UID);
		}
		function waitResult(uint UID, string pattern) {
        Launch(msg.sender,"waitResult", pattern, "", "", UID);
		}

    /*
     * ONLY BY BRIDGE
     * The following functions are called only by the bridge, to modify the state of the XWObject
     */
		function addUID(address owner, uint _UID, string _appName, string _timestamp, Status _status) onlyBy(bridge) {
		    //workRegisteries[owner].push(XWObject({UID : _UID, name : _appName, timestamp : _timestamp, status : _status, stdout: "", pattern: ""}));
		    workRegisteries[owner][_UID].name = _appName;
		    workRegisteries[owner][_UID].timestamp = _timestamp;
		    workRegisteries[owner][_UID].status = _status;
		}
/*
    function setStdout(uint UID, string _stdout, address owner) onlyBy(bridge) {
    }
*/
    function pushResult(uint _UID, address owner, string _stdout) onlyBy(bridge) {
      workRegisteries[owner][_UID].stdout = _stdout;
      workRegisteries[owner][_UID].status = Status.Completed;
    }

    /*
     * EVENTS AND MODIFIERS
     */
    event Launch( address indexed user, string functionName, string param1, string param2, string param3,uint UID); // special log to launch process
    event Logs(string status, address indexed user); // logs for the front-end or smart contract to react correctly

 	  modifier onlyBy(address a){
	      if (msg.sender != a) throw;
	      _;
	  }
}
