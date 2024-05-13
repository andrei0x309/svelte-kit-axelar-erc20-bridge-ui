// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


// import "hardhat/console.sol";

contract FaucetERC20 is Initializable, PausableUpgradeable, OwnableUpgradeable, UUPSUpgradeable {

    using BytesLib for bytes;
    using Address for address;
 
    address erc20TokenAddres;
    uint maxValidity;
    uint faucetSendAmount;

    mapping (address => uint) public lastClaimTs;

    event FaucetExecuted(address userAddress, uint256 amount, uint timestamp);


    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // INIT and contract control functions
    function initialize(address _initialOwner, address _initToken, uint _maxValidity) initializer public {
        
        erc20TokenAddres = _initToken;
        maxValidity = _maxValidity;
        faucetSendAmount =  5000000000000000000000;

        __Pausable_init();
        __Ownable_init(_initialOwner);
        __UUPSUpgradeable_init();
    }
    
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}
 
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function isPaused() public view returns (bool) {
        return paused();
    }

    // PUBLIC FUNCTIONS

    function faucet() public {
        require(!paused(), "Contract is paused");
        address userAddress = msg.sender;

        uint lastClaim = lastClaimTs[userAddress];
        uint curentTime = block.timestamp;

        if ( lastClaim > 0 &&  curentTime < lastClaim + maxValidity) {
            string memory maxValidityS = Strings.toString((lastClaim + maxValidity) - curentTime);
            revert(string(abi.encodePacked("Claim executed to recently, wait ", maxValidityS, " seconds to try another claim")));
        }

       if( ERC20(erc20TokenAddres).balanceOf(address(this)) < faucetSendAmount) {
            revert("Insufficient balance in contract");
        }

        ERC20(erc20TokenAddres).transfer(userAddress, faucetSendAmount);

        lastClaimTs[userAddress] = curentTime;
 
        emit FaucetExecuted(userAddress, faucetSendAmount, curentTime);

    }
  
    function getMaxValidity() public view returns (uint) {
        return maxValidity;
    }

    function getBalance(address tokenAddress) public view returns (uint256) {
        return ERC20(tokenAddress).balanceOf(address(this));
    }

    function getOwner() public view returns (address) {
        return owner();
    }

    // ONLY OWNER FUNCTIONS

    function getTsOfLastClaim(address userAddress) public view returns (uint) {
        return lastClaimTs[userAddress];
    }

    function getContractToken() public view returns (address) {
        return erc20TokenAddres;
    }

    function setContractToken(address newTokenAddress) public onlyOwner {
        erc20TokenAddres = newTokenAddress;
    }

    function setOwner(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
    }

    function setIntialState(address _initialOwner, address _initToken) public onlyOwner {
        transferOwnership(_initialOwner);
        erc20TokenAddres = _initToken;
    }

    function setMaxValidity(uint _maxValidity) public onlyOwner {
        maxValidity = _maxValidity;
    }

        function transferTokens(address tokenAddress, address to, uint256 amount) public onlyOwner {
        ERC20(tokenAddress).transfer(to, amount);
    }

    function withdrawTokens(address tokenAddress, uint256 amount) public onlyOwner {
        ERC20(tokenAddress).transfer(msg.sender, amount);
    }

    function withdrawNative(uint256 amount) public onlyOwner {
        payable(msg.sender).transfer(amount);
    }

}