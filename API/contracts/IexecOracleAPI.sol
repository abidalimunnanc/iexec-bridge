pragma solidity ^0.4.11;
import "./IexecOracle.sol";

contract IexecOracleAPI{

    address iexecOracleAddress;

    //constructor
    function IexecOracleAPI(address _iexecOracleAddress) {
        iexecOracleAddress=_iexecOracleAddress;
        IexecOracle iexecOracle = IexecOracle(iexecOracleAddress);
        iexecOracle.registerConsumerSmartContract();
    }

    function iexecRegister(string appName) {
        IexecOracle iexecOracle = IexecOracle(iexecOracleAddress);
        iexecOracle.register(appName);
    }

    function impossible(address _iexecOracleAddress) {
        IexecOracle iexecOracle = IexecOracle(_iexecOracleAddress);
        iexecOracle.registerConsumerSmartContract();
    }

}
