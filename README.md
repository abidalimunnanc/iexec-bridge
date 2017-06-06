#API    
The role of the API will be to communicate with the bridge to launch xtremweb command, then get the result. Its constitued of two parts:    
The solidity API who try to reproduce XTREMWEB behaviour and the bridge in nodeJS, who listen solidity event and then rewrite in smart contract the result.    

#Bridge    
`Bridge/`
The role of the bridge will be to connect the smart contract and the xtremWeb computation, acting just like a gateway between the two layer

TODO:    
Call the XTREAMWEB API

#API    
`API/`    
A truffle repository with contract which reproduce XTREMWEB API.    

TODO:
Add test 

###inspiration    
https://github.com/oraclize/ethereum-bridge    
https://github.com/oraclize/ethereum-api     
