import { useState } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import * as secp from "ethereum-cryptography/secp256k1";

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
      const messageHash = keccak256(utf8ToBytes(message));
      
      // Sign the message
      const [signature, recoveryBit] = await secp.sign(messageHash, privateKey, {
        recovered: true
      });

      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: amount,
        recipient,
        signature: Array.from(signature), // Convert Uint8Array to regular array
        recoveryBit,
        messageHash: Array.from(messageHash),
      });
      
      setBalance(balance);
    } catch (ex) {
      console.error(ex);
      alert(ex.response.data.message);
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
