# Oracle Service for Twitter 

This project is an oracle service that allows a zkApp (a smart contract on the Mina blockchain) to retrieve information from Twitter. 

## Overview

The oracle retrieves the latest tweet of a given user using the Twitter API and exposes a REST API endpoint that allows the zkApp to fetch the contents of the tweet, signed by the oracle. The oracle parses the output of the Twitter API calls to extract a SHA256 hash embedded within the tweet's text.

## API Endpoint

The zkApp can call the following endpoint to retrieve the latest tweet from a specified Twitter user:

`GET /getLatestTweet/:username`

This endpoint will respond with the following object:

```json
{
    "tweetData": {
        "endorser": ":username",
        "text": "I endorse NFT with hash 4ea8dba3ebbd60055e488f887894f83bad53dd211031c563908ed5f36b8b7a73"
    },
    "signedData": {
        "endorserHash": "26648954008517657130692534198215742792916116540943147107938897297516849142696",
        "nftPoseidonHash": "20590476033725623984114383506579831719048950061743968044989189467132111909415"
    },
    "signature": {
        "r": "1577926502774164233861426996606039106804035397155337292987232977941149750888",
        "s": "12459234577719884987272114675870616338595680513365948652333758822748652811263"
    },
    "publicKey": "B62qqVT16fNj4nAkCApWUKyr4YVxuunbUSuXfM4gRVDKveEmjsSNWVS"
}
```

Here is a brief explanation of each part:
- `endorser` is the username used to query the oracle.
- `text` is the text from the latest endorser's tweet.
- `endorserHash` is the Poseidon hash of the `endorser`.
- `nftPoseidonHash` is the Poseidon hash of the SHA256 Hash of the NFT that was tweeted by the `endorser`.
- `signature` is a Schnorr signature of the `signedData` object, which contains `endorserHash` and `nftPoseidonHash`.
- `publicKey` is the public key corresponding to the private key the oracle used to sign the data.


## Installation

1. Clone the repository: `git clone https://github.com/racampos/cpone-oracle.git`
2. Change into the project directory: `cd cpone-oracle`
3. Install the dependencies: `npm install`

## Usage

To start the server, use the command: `npm start`. By default, the server starts on port 3000, but this can be configured by setting the `PORT` environment variable.

## Deploying to Heroku

This application can be easily deployed to Heroku:

1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli#download-and-install)
2. Login to your Heroku account: `heroku login`
3. Create a new Heroku app: `heroku create cpone-oracle`
4. Push your code to the Heroku remote: `git push heroku main`

## License

Apache 2.0

# To Do

## Implementing a Two-Party Computation Scheme

Our current system relies on retrieving data directly from Twitter. While this data is fetched over a secure TLS connection, both the client and server possess the encryption and signing keys for the TLS session. This means there's no cryptographic proof that the retrieved data has not been tampered with by the client.

A potential enhancement to our system is to incorporate a Two-Party Computation (2PC) scheme, similar to what's used in protocols like TLSNotary and DECO. 

### The TLSNotary Approach

In the TLSNotary protocol, the TLS session keys are split between the user (client) and a notary (server). The user's requests are encrypted and authenticated using a secure 2PC protocol. At no point does either the user or the notary have access to the full TLS session keys. This way, it is possible to provide a proof of the authenticity of communication, while maintaining privacy and the security assumptions of TLS.

### The DECO Approach

The DECO protocol addresses the technical challenges of designing a system that ensures security and practical performance, using legacy-(TLS)-compatible primitives. DECO introduces a three-party handshake protocol between the prover (client), verifier (server), and web server that creates an unforgeable commitment from the prover to the verifier on a piece of TLS session data. This provides a way for the verifier to check that the data is authentically from the TLS server, while preserving the security of TLS from the prover's perspective.

### The Challenge

The challenge of implementing such a scheme in our oracle lies in designing a system that can:
- generate an unforgeable commitment of the TLS session data,
- verify that this data is authentically from the Twitter server,
- and do all this while preserving the security and privacy assumptions of TLS.

Successfully implementing such a scheme would provide a strong guarantee of the integrity of the data retrieved from Twitter, and would be a significant improvement to our system.
