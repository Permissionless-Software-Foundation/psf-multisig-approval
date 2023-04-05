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

  // Retrieve a list of NFTs from the Group token that spawned them.
  async getNftsFromGroup (groupId = '8e8d90ebdb1791d58eba7acd428ff3b1e21c47fb7aba2ba3b5b815aa0fe7d6d5') {
    try {
      const groupData = await this.wallet.getTokenData(groupId)
      // console.log('groupData: ', groupData)

      const nfts = groupData.genesisData.nfts

      return nfts
    } catch (err) {
      console.error('Error in getNftsFromGroup()')
      throw err
    }
  }
}

module.exports = NFTs
