<h1 align="center" style="margin-top: 1em; margin-bottom: 3em;">
  <p>
  <a href="https://signatory.dev">
    <img alt="open-rpc logo" src="https://user-images.githubusercontent.com/10556209/73570773-a07fb900-4432-11ea-8ed1-3bf525af04d9.png" alt="signatory.dev" width="125">
  </a>
</p>

<center>
  <h3 align="center">Signatory</h3>

  <p align="center">
    🔏A transaction and message signer for the Ethereum Stack
    <br />
    <a href="https://expedition.dev">signatory.dev</a>
    ·
    <a href="https://github.com/etclabscore/signatory/issues/new?assignees=&labels=&template=bug_report.md&title=">Report Bug</a>
    ·
    <a href="https://github.com/etclabscore/signatory/issues/new?assignees=&labels=&template=feature_request.md&title=">Request Feature</a>
  </p>
</center>
</h1>


[View The Documentation](https://signatory.dev/api-documentation)


## The Problem

Most Existing Ethereum Clients include wallets or signers within the full node. This bloats client software and introduces more surface area for security issues to arise. The signing software should be offline and separate from a full node client to ensure proper separation of concerns.

## The Goal

Signatory is a JSON-RPC API to support the generation, import, and/or storing of Ethereum Private Keys. It uses the [Web3 Secret Storage Defition](https://github.com/ethereumproject/wiki/wiki/Web3-Secret-Storage-Definition) to store keys offline and optionally use [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) to generate mnemonic phrases. This software has no access to outside nodes or APIs.

## Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.
