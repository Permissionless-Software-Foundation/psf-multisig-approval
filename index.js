/*
  This library implement PS009 specification:
  https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps009-multisig-approval.md
*/

/* eslint-disable no-async-promise-executor */

// global libraries

// Local libraries
const NFTs = require('./lib/nfts')

class MultisigApproval {
  constructor (localConfig = {}) {
    this.wallet = localConfig.wallet
    if (!this.wallet) {
      throw new Error('Instance of minimal-slp-wallet must be passed in as a property called \'wallet\', when initializing the psf-multisig-approval library.')
    }

    // Encapsulate dependencies
    this.nfts = new NFTs(localConfig)
  }

  // This function retrieves the NFTs associated with a Group token ID. It then
  // tries to retrieve the BCH addresses and public keys of the holders of those
  // NFTs. It returns an object with all that information in it.
  // The function defaults to the PSF Minting Council, but any Group token ID
  // can be used.
  async getNftInfo (groupTokenId = '8e8d90ebdb1791d58eba7acd428ff3b1e21c47fb7aba2ba3b5b815aa0fe7d6d5') {
    try {
      // console.log('groupTokenId: ', groupTokenId)

      const nfts = await this.nfts.getNftsFromGroup()

      const addrs = await this.nfts.getAddrsFromNfts(nfts)

      const { keys, keysNotFound } = await this.nfts.findKeys(addrs, nfts)

      return { keys, keysNotFound }
    } catch (err) {
      console.error('Error in getNftInfo(): ', err)
      throw err
    }
  }
}

module.exports = MultisigApproval
