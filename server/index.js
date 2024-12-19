const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

app.use(cors());
app.use(express.json());

const balances = {
  "0x1": 100,
  "0x2": 50,
  "0x3": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // Get signature, recovery bit, and message hash from the client
  const { sender, recipient, amount, signature, recoveryBit, messageHash } = req.body;

  try {
    // Recover the public key from the signature
    const publicKey = secp.recoverPublicKey(messageHash, signature, recoveryBit);
    const address = toHex(publicKey);

    // Verify that the recovered address matches the sender
    if (address !== sender) {
      res.status(400).send({ message: "Invalid signature!" });
      return;
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Invalid transaction!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
