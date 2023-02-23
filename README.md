# NFT Dutch Auction #

[DEMO](https://stackblitz.com/edit/vitejs-vite-n1dvam)

Welcome to NFT Dutch Auction. This project helps users create and sell their NFTs in our very own market place. NFTs are sold in a Dutch Auction manner, so that creators can get maximum profits.

### How it works? ###

* Users join as members through their metamask wallet
* Users can create new NFTs by uploading images
* They can sell their NFTs by auctioning
* The Auction begins by other members bidding on items provided for sale
* The highest bid amount is used as starting price when NFT moves to purchase state
* In purchase state, NFT's price keeps depeciating in regular intervals at a contstant rate
* The member who clicks on BUY, gets the NFT on that price.

### How do I get set up? ###

* npm install
* npm run dev
* Make sure to have Metamask extension installed in your browser, and have an account in Goerli Ethereum testnet

### Contract on Goerli Testnet ###

* [0xf721be304E7B5902bF94Ae2b0B973908C5893f22](https://goerli.etherscan.io/address/0xf721be304e7b5902bf94ae2b0b973908c5893f22)

### Checkout the contract
* auction.sol file
