pragma solidity ^0.4.8,

contract AppInterface() {
	string public URI_LinuxIX86;
	string public URI_LinuxAmd64;
	string public URI_LinuxX8664;

    event Launch( address indexed user, string fction, string param1, string param2); // special log to launch process
    event Logs(string status, address indexed user); // logs for the front-end or smart contract to react correctly
}