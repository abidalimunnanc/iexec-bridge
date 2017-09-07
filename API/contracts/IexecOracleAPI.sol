pragma solidity ^0.4.11;
import "./IexecOracle.sol";

contract IexecOracleAPI{

    address iexecOracleAddress;

    //constructor
    function IexecOracleAPI(address _iexecOracleAddress) {
        iexecOracleAddress=_iexecOracleAddress;
        IexecOracle iexecOracle = IexecOracle(iexecOracleAddress);
        iexecOracle.registerSmartContractAndCreator();
    }

    function iexecRegister(string appName) {
        IexecOracle iexecOracle = IexecOracle(iexecOracleAddress);
        iexecOracle.register(appName);
    }

    function iexecSetParam(string workUid, string param, string value) {
        IexecOracle iexecOracle = IexecOracle(iexecOracleAddress);
        iexecOracle.setParam(workUid, param, value);
    }

    function iexecSetPending(string workUid) {
        IexecOracle iexecOracle = IexecOracle(iexecOracleAddress);
        iexecOracle.setPending(workUid);
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

}
