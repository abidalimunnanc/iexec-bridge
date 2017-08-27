pragma solidity ^0.4.11;
import "./IexecOracleAPI.sol";
contract LS is IexecOracleAPI{

  function LS (address _iexecOracleAddress) IexecOracleAPI(_iexecOracleAddress){

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
