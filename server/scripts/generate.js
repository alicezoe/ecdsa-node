const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp.secp256k1.utils.randomPrivateKey();
console.log('private key:', toHex(privateKey));

const publicKey = secp.secp256k1.getPublicKey(privateKey);
console.log('public key:', toHex(publicKey));

function getAddress(publicKey) {
  // Ethereum's address transformation takes the last 20 bytes of the hash of the public key
  return keccak256(publicKey.slice(1)).slice(-20);
}