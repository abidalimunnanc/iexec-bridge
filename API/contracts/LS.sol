pragma solidity ^0.4.11;
import "./IexecWorksConsumer.sol";
contract LS is IexecWorksConsumer{

  function LS (address _iexecWorksGateway) IexecWorksConsumer(_iexecWorksGateway){

  }

  function iexecLS(){
    iexecRegister("ls");
    //TODO
    //iexecSetParam(uid,"-ltr");
    //iexecSetPending(uid);
    //iexecGetResult(uid,"ls");
  }

  //trigger thanks event watched in XtremWebInterface
/*  function getMyIexecLSResult(uid){
      XtremWebInterface iexecInterface = XtremWebInterface(xtremWebInterface);
      iexecInterface.getWorkStdout(msg.sender,this,uid);
  }
*/



}
