# Signatory

🔏A transaction and message signer for the Ethereum Stack.

[View The Documentation](https://signatory.dev/api-documentation)


## The Problem

Most Existing Ethereum Clients include wallets or signers within the full node. This bloats client software and introduces more surface area for security issues to arise. The signing software should be offline and separate from a full node client to ensure proper separation of concerns.

## The Goal

Signatory is a JSON-RPC API to support the generation, import, and/or storing of Ethereum Private Keys. It uses the [Web3 Secret Storage Defition](https://github.com/ethereumproject/wiki/wiki/Web3-Secret-Storage-Definition) to store keys offline and optionally use [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) to generate mnemonic phrases. This software has no access to outside nodes or APIs.

## Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.
