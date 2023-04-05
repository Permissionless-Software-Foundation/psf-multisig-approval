/*
  This library contains code for handling NFT and Group SLP tokens. Specifically
  it has functions around looking up the NFTs related to a Group token, then
  retrieving data on the holders of those NFTs.
*/

class NFTs {
  constructor (localConfig = {}) {
    this.wallet = localConfig.wallet
    if (!this.wallet) {
      throw new Error('Instance of minimal-slp-wallet must be passed in as a property called \'wallet\', when initializing the nfts.js library.')
    }
  }
}

module.exports = NFTs
