pragma solidity ^0.4.11,

contract XtremWebInterface {

        address public bridge;

        function XtremWebInterface() {
            bridge = msg.sender;
        }

        enum Status {Completed, Pending, Running, Waiting, Error}

		struct XWObject {
			string name;        // application name
			string timestamp;
			Status status;
			string stdout;
			string pattern;
		}

		mapping (address => mapping (uint => XWObject)) public workRegisteries;


		function register(string appName) {
            Launch(msg.sender,"register", appName, "", 0);
		}

		// param = commandline
		function submit(string appName, string param) {
			Launch(msg.sender,"submit", param, "", 0);
		}

		function getStatus() returns (Status) {
		    return workRegisteries[msg.sender][0].status;
		}

		function submitAndWait(string appName, string param, string pattern) {
		    Launch(msg.sender,"submitAndWait", pattern, "", 0);
		}
		function setParam(uint UID, string paramName, string paramValue) {
		    Launch(msg.sender,"setParam", paramName, paramValue, UID);
		}
		function setPending(uint UID) {
		    Launch(msg.sender,"setParam", "status", "pending", UID);
		}
		function status(uint UID) {
		    Launch(msg.sender,"status", "", "", UID);
		}
		function result(uint UID) {
		    Launch(msg.sender,"result", "", "", UID);
		}
		function stdout(uint UID) {
		    Launch(msg.sender,"stdout", "", "", UID);
		}
		function toDelete(uint UID) {
		    Launch(msg.sender,"toDelete", "", "", UID);
		}
		function waitResult(uint UID, string pattern) {
            Launch(msg.sender,"waitResult", pattern, "", UID);
		}

        // only by bridge
		function addUID(address owner, uint _UID, string _appName, string _timestamp, Status _status) onlyBy(bridge) {
		    //workRegisteries[owner].push(XWObject({UID : _UID, name : _appName, timestamp : _timestamp, status : _status, stdout: "", pattern: ""}));
		    workRegisteries[owner][_UID].name = _appName;
		    workRegisteries[owner][_UID].timestamp = _timestamp;
		    workRegisteries[owner][_UID].status = _status;
		}

        function setStdout(uint UID, string _stdout, address owner) onlyBy(bridge) {

        }

        event Launch( address indexed user, string functionName, string param1, string param2, uint UID); // special log to launch process
        event Logs(string status, address indexed user); // logs for the front-end or smart contract to react correctly

 	    modifier onlyBy(address a){
	        if (msg.sender != a) throw;
	        _;
	    }
}
