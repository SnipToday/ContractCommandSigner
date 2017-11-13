# ContractCommandSigner

A simple Node.js server with a single functionality: signing an Ethereum smart contract command.
The server receives an address, creates a contract command and signs it using the private key.

The server supports 2 commands - add to whitelist and add to uncapped whitelist, but can easily be tweaked to sign any other command of your contract.
