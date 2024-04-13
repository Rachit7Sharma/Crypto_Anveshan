const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Web3 = require('web3');
const bitcoin = require('bitcoinjs-lib');
const Meowcoin = require('./meowcoinjs-lib');

const app = express();

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/crypto_platform', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    ethereumWalletAddress: String,
    ethereumPrivateKey: String,
    bitcoinAddress: String,
    bitcoinPrivateKey: String,
    meowcoinAddress: String, 
    meowcoinPrivateKey: String, 
});

const User = mongoose.model('User', userSchema);

const web3 = new Web3('https://ropsten.infura.io/v3/YOUR_INFURA_PROJECT_ID');

const bitcoinNetwork = bitcoin.networks.testnet;
const bitcoinClient = new bitcoin.ElectrumClient('electrumx-server.example.org', 50002);

bitcoinClient.connect();

const meowcoinNetwork = 'mainnet'; 


app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        const ethereumWallet = web3.eth.accounts.create();
        
        const bitcoinWallet = bitcoin.ECPair.makeRandom({ network: bitcoinNetwork });

        const meowcoinPrivateKey = Meowcoin.generatePrivateKey();
        const meowcoinPublicKey = Meowcoin.getPublicKey(meowcoinPrivateKey);
        const meowcoinAddress = Meowcoin.getAddress(meowcoinPublicKey);

        const newUser = new User({
            username,
            password,
            ethereumWalletAddress: ethereumWallet.address,
            ethereumPrivateKey: ethereumWallet.privateKey,
            bitcoinAddress: bitcoin.payments.p2pkh({ pubkey: bitcoinWallet.publicKey, network: bitcoinNetwork }).address,
            bitcoinPrivateKey: bitcoinWallet.toWIF(),
            meowcoinAddress,
            meowcoinPrivateKey,
        });
        await newUser.save();
        
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ username: user.username }, 'SECRET_KEY');
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, 'SECRET_KEY', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.user = user;
        next();
    });
}

app.get('/api/users/:username/ethereum-wallet', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const balance = await web3.eth.getBalance(user.ethereumWalletAddress);
        res.json({ ethereum: web3.utils.fromWei(balance, 'ether') });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/:username/bitcoin-wallet', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const balance = await bitcoinClient.getBalance(user.bitcoinAddress);
        res.json({ bitcoin: balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/:username/meowcoin-wallet', authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const balance = await Meowcoin.getBalance(user.meowcoinAddress);
        res.json({ meowcoin: balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ethereum-transactions', authenticateToken, async (req, res) => {
    try {
        const { username, amount, recipient } = req.body;
        
        const sender = await User.findOne({ username });
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        const tx = await web3.eth.accounts.signTransaction({
            to: recipient,
            value: web3.utils.toWei(amount.toString(), 'ether'),
            gas: 2000000
        }, sender.ethereumPrivateKey);
        const receipt = await web3.eth.sendSignedTransaction(tx.rawTransaction);

        const transaction = new Transaction({
            from: sender.ethereumWalletAddress,
            to: recipient,
            amount,
            cryptocurrency: 'ethereum',
            transactionHash: receipt.transactionHash
        });
        await transaction.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/bitcoin-transactions', authenticateToken, async (req, res) => {
    try {
        const { username, amount, recipient } = req.body;
        
        const sender = await User.findOne({ username });
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        const txb = new bitcoin.TransactionBuilder(bitcoinNetwork);
        txb.addInput(sender.bitcoinAddress, balance);
        txb.addOutput(recipient, amount);
        txb.sign(0, bitcoin.ECPair.fromWIF(sender.bitcoinPrivateKey, bitcoinNetwork));

        const txHex = txb.build().toHex();
        const txId = await bitcoinClient.broadcast(txHex);

        const transaction = new Transaction({
            from: sender.bitcoinAddress,
            to: recipient,
            amount,
            cryptocurrency: 'bitcoin',
            transactionHash: txId
        });
        await transaction.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/meowcoin-transactions', authenticateToken, async (req, res) => {
    try {
        const { username, amount, recipient } = req.body;
        
        const sender = await User.findOne({ username });
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        const rawTransaction = Meowcoin.createTransaction(sender.meowcoinPrivateKey, sender.meowcoinAddress, recipient, amount);

        const txId = await Meowcoin.broadcastTransaction(rawTransaction);

        const transaction = new Transaction({
            from: sender.meowcoinAddress,
            to: recipient,
            amount,
            cryptocurrency: 'meowcoin',
            transactionHash: txId
        });
        await transaction.save();

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
