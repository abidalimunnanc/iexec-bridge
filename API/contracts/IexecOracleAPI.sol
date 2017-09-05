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

    function iexecSetParam(string uid, string param, string value) {
        IexecOracle iexecOracle = IexecOracle(iexecOracleAddress);
        iexecOracle.setParam(uid, param, value);
    }


    function impossible(address _iexecOracleAddress) {
        IexecOracle iexecOracle = IexecOracle(_iexecOracleAddress);
        iexecOracle.registerSmartContractAndCreator();
    }

}
