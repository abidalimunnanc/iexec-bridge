pragma solidity ^0.4.11;
import "./IexecWorksGateway.sol";
contract LS {

  address iexecWorksGateway;

  function LS (address _iexecWorksGateway){
    iexecWorksGateway=_iexecWorksGateway;
  }

  function iexecLS(){
    IexecWorksGateway iexecInterface = IexecWorksGateway(iexecWorksGateway);
    iexecInterface.register("ls");
  }

  //trigger thanks event watched in XtremWebInterface
/*  function getMyIexecLSResult(uid){
      XtremWebInterface iexecInterface = XtremWebInterface(xtremWebInterface);
      iexecInterface.getWorkStdout(msg.sender,this,uid);
  }
*/



}
