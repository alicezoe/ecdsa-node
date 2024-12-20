const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require('ethereum-cryptography/secp256k1');
const { toHex } = require('ethereum-cryptography/utils');

app.use(cors());
app.use(express.json());

const balances = {
  "0x1": 100,
  "0x2": 50,
  "0x3": 75,
  "0486afd3c48501dc20a30b672e1d96baf018ea361ae580ae7e9cda7aa8d3b31c6c1a62f2fa7ba0802b6c913c9c93c6410100665529ddcf18eb992d8f05d8ec02c9": 100
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, messageHash } = req.body;

  try {
    const sig = new Uint8Array(signature);
    const hash = new Uint8Array(messageHash);
    
    // Verify the signature
    const isValid = secp.verify(sig, hash, sender);

    if (!isValid) {
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
