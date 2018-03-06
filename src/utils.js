const Debug = require('debug');
const tx = require('@warren-bank/ethereumjs-tx-sign');
const { privateToPublic } = require('@warren-bank/ethereumjs-tx-sign/lib/keypairs');
const { publicToAddress } = require('@warren-bank/ethereumjs-tx-sign/lib/keypairs');

const debug = Debug('iexec:utils');
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const BLOCK_GAS_LIMIT = 4600000;

const walletFromPrivKey = privateKey => ({
  privateKey,
  publicKey: privateToPublic(privateKey),
  address: publicToAddress(privateToPublic(privateKey)),
});

const signAndSendTx = async ({
  web3,
  userWallet,
  unsignedTx,
  nonceOffset,
  contractAddress = ZERO_ADDRESS,
  chainID,
}) => {
  try {
    debug('userWallet.address', userWallet.address);
    const [networkGasPrice, nonce, estimatedGas] = await Promise.all([
      web3.eth.getGasPrice(),
      web3.eth.getTransactionCount('0x'.concat(userWallet.address)),
      web3.eth.estimateGas({ data: unsignedTx, to: contractAddress, from: '0x'.concat(userWallet.address) }),
    ]);
    debug('networkGasPrice', networkGasPrice);
    debug('nonce', nonce);
    debug('estimatedGas', estimatedGas);
    const gasLimit = Math.min(estimatedGas, BLOCK_GAS_LIMIT);

    const txObject = {
      nonce: web3.utils.toHex(nonce + nonceOffset),
      gasPrice: web3.utils.toHex(networkGasPrice * 2),
      gasLimit: web3.utils.toHex(gasLimit),
      data: unsignedTx,
      chainId: parseInt(chainID, 10),
      to: contractAddress,
    };
    debug('nonce', nonce);
    debug('nonceOffset', nonceOffset);
    const { rawTx } = tx.sign(txObject, userWallet.privateKey);
    return web3.eth.sendSignedTransaction('0x'.concat(rawTx))
      .on('transactionHash', txHash => debug('txHash', txHash));
  } catch (error) {
    debug('signAndSendTx()', error);
    throw error;
  }
};

const sleep = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
  walletFromPrivKey,
  signAndSendTx,
  sleep,
};
