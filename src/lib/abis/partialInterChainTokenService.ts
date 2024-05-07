export const interchainTokenServiceContractABI = [
  {
    "inputs": [
        {
            "internalType": "bytes32",
            "name": "tokenId",
            "type": "bytes32"
        },
        {
            "internalType": "string",
            "name": "destinationChain",
            "type": "string"
        },
        {
            "internalType": "bytes",
            "name": "destinationAddress",
            "type": "bytes"
        },
        {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        },
        {
            "internalType": "bytes",
            "name": "metadata",
            "type": "bytes"
        },
        {
            "internalType": "uint256",
            "name": "gasValue",
            "type": "uint256"
        }
    ],
    "name": "interchainTransfer",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
]