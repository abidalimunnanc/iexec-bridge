pragma solidity ^0.4.11;
import "./XtremWebInterface.sol";
contract LS {

  address xtremWebInterface;

  function LS (address _xtremWebInterface){
    xtremWebInterface=_xtremWebInterface;
  }

  function iexecLS(){
    XtremWebInterface iexecInterface = XtremWebInterface(xtremWebInterface);
    iexecInterface.register("ls");
  }

  //trigger thanks event watched in XtremWebInterface
/*  function getMyIexecLSResult(uid){
      XtremWebInterface iexecInterface = XtremWebInterface(xtremWebInterface);
      iexecInterface.getWorkStdout(msg.sender,this,uid);
  }
*/



}
