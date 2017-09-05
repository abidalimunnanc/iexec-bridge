pragma solidity ^0.4.11;
import "./IexecOracleAPI.sol";
contract HelloWorld is IexecOracleAPI{

  function HelloWorld (address _iexecOracleAddress) IexecOracleAPI(_iexecOracleAddress){

  }

  function registerEcho(){
    iexecRegister("echo");
  }

  function setHelloWorldParam(string uid, string helloText){
    iexecSetParam(uid,"",helloText);
  }

}
