pragma solidity ^0.4.11;
import "./IexecOracle.sol";
import './IexecLib.sol';

contract IexecOracleAPI{


    address iexecOracleAddress;
    event IexecCallbackEvent(string callbackType, address indexed user, address indexed provider, address indexed creator, string appName, string workUid, IexecLib.StatusEnum status, string errorMsg);

    //constructor
    function IexecOracleAPI(address _iexecOracleAddress) {
        iexecOracleAddress=_iexecOracleAddress;
        IexecOracle iexecOracle = IexecOracle(iexecOracleAddress);
        iexecOracle.registerSmartContractAndCreator();
    }

    function iexecSubmit(string appName, string param) {
        IexecOracle iexecOracle = IexecOracle(iexecOracleAddress);
        iexecOracle.submit(appName,param);
    }

    function iexecStatus(string workUid) {
        IexecOracle iexecOracle = IexecOracle(iexecOracleAddress);
        iexecOracle.status(workUid);
    }

    function iexecResult(string workUid) {
        IexecOracle iexecOracle = IexecOracle(iexecOracleAddress);
        iexecOracle.stdout(workUid);
    }

    function impossible(address _iexecOracleAddress) {
        IexecOracle iexecOracle = IexecOracle(_iexecOracleAddress);
        iexecOracle.registerSmartContractAndCreator();
    }

    function iexecCallback(string callbackType, address user, address provider, address creator, string appName, string workUid, IexecLib.StatusEnum status, string errorMsg){
        require(msg.sender == iexecOracleAddress);
        IexecCallbackEvent( callbackType, user, provider, creator, appName, workUid, status, errorMsg);
    }
}
