import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex, hexToBytes } from "ethereum-cryptography/utils";

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    try {
      const privateKey = evt.target.value;
      setPrivateKey(privateKey);
      
      if (privateKey) {
        // Convert private key from hex to bytes
        const privateKeyBytes = hexToBytes(privateKey);
        const publicKey = secp.getPublicKey(privateKeyBytes);
        const address = toHex(publicKey);
        setAddress(address);
        
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
      } else {
        setAddress("");
        setBalance(0);
      }
    } catch (error) {
      console.error("Error in onChange:", error);
      setAddress("");
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type in a Private Key" value={privateKey} onChange={onChange}></input>
      </label>

      <label>
        Address
        <input placeholder="Address" value={address} disabled></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
