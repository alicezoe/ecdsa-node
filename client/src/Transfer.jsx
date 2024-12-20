import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex, hexToBytes } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const amount = parseInt(sendAmount);
      
      // Create message hash
      const message = JSON.stringify({
        sender: address,
        amount: amount,
        recipient: recipient,
      });
      
      const messageBytes = utf8ToBytes(message);
      const messageHash = keccak256(messageBytes);
      
      // Convert private key from hex to bytes
      const privateKeyBytes = hexToBytes(privateKey);
      
      // Sign the message
      const [signature, recoveryBit] = await secp.sign(messageHash, privateKeyBytes, {
        recovered: true
      });

      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: amount,
        recipient,
        signature: Array.from(signature),
        recoveryBit,
        messageHash: Array.from(messageHash),
      });
      
      setBalance(balance);
      setSendAmount("");
      setRecipient("");
    } catch (ex) {
      console.error(ex);
      alert(ex.message || "Error processing transaction");
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
