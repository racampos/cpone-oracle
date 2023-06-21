const express = require('express');
const axios = require('axios');
const app = express();
const {
    isReady,
    PrivateKey,
    Signature,
    CircuitString,
    Poseidon,
  } = require('snarkyjs');
require('dotenv').config()

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY;

app.get('/getLatestTweet/:username', async (req, res) => {
    const username = req.params.username;

    try {

        const userResponse = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
            headers: {
                "Authorization": `Bearer ${TWITTER_BEARER_TOKEN}`
            }
        });

        const userId = userResponse.data.data.id;

        const tweetsResponse = await axios.get(`https://api.twitter.com/2/users/${userId}/tweets`, {
            headers: {
                "Authorization": `Bearer ${TWITTER_BEARER_TOKEN}`
            }
        });

        const latestTweet = tweetsResponse.data.data[0].text;
        const match = latestTweet.match(/[0-9a-fA-F]{64}/);
        let nftSha256HashHex = "";

        if (match) {
            nftSha256HashHex = match[0];
        } else {
            throw new Error("No hash found in this user's latest tweet.");
        }

        await isReady
        const nftHashCS = CircuitString.fromString(nftSha256HashHex);
        const nftHash = Poseidon.hash(nftHashCS.toFields());

        const endorser = CircuitString.fromString(username);
        const endorserHash = Poseidon.hash(endorser.toFields());

        const privKey = PrivateKey.fromBase58(ORACLE_PRIVATE_KEY);
        const pubKey = privKey.toPublicKey();

        const signature = Signature.create(privKey, [nftHash, endorserHash]);

        res.json({
            tweetData: {
                endorser: username,
                text: latestTweet
            },
            signedData: {
                endorserHash: endorserHash,
                nftPoseidonHash: nftHash
            },
            signature: signature,
            publicKey: pubKey
        });
    } catch (error) {
        console.error(String(error));
        res.status(500).send(String(error));
    }
});

const port = process.env.PORT;
app.listen(port, '0.0.0.0', () => console.log(`Server is running on port ${port}`));
