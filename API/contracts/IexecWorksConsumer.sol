pragma solidity ^0.4.11;
import "./IexecWorksGateway.sol";

contract IexecWorksConsumer {

    address iexecWorksGateway;

    //constructor
    function IexecWorksConsumer(address _iexecWorksGateway) {
        iexecWorksGateway=_iexecWorksGateway;
        IexecWorksGateway iexecInterface = IexecWorksGateway(_iexecWorksGateway);
        iexecInterface.registerConsumerSmartContract();
    }

    function iexecRegister(string appName) {
        IexecWorksGateway iexecInterface = IexecWorksGateway(iexecWorksGateway);
        iexecInterface.register(appName);
    }

    function impossible(address _iexecWorksGateway) {
        IexecWorksGateway iexecInterface = IexecWorksGateway(_iexecWorksGateway);
        iexecInterface.registerConsumerSmartContract();
    }

}
