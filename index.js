/*
  This library implement PS009 specification:
  https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps009-multisig-approval.md
*/

/* eslint-disable no-async-promise-executor */

// global libraries
const bitcore = require('bitcore-lib-cash')

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
  async getNftHolderInfo (groupTokenId = '8e8d90ebdb1791d58eba7acd428ff3b1e21c47fb7aba2ba3b5b815aa0fe7d6d5') {
    try {
      // console.log('groupTokenId: ', groupTokenId)

      const nfts = await this.nfts.getNftsFromGroup()

      const addrs = await this.nfts.getAddrsFromNfts(nfts)

      const { keys, keysNotFound } = await this.nfts.findKeys(addrs, nfts)

      return { keys, keysNotFound }
    } catch (err) {
      console.error('Error in getNftHolderInfo(): ', err)
      throw err
    }
  }

  // Generate a P2SH multisignature wallet from the public keys of the NFT holders.
  // The address for the wallet is returned.
  // The input for this function should be the `keys` output from
  // getNftHolderInfo()
  createMultisigAddress (inObj = {}) {
    try {

      const {keyPairs} = inObj
      let requiredSigners = inObj.requiredSigners

      // Input validation
      if(!Array.isArray(keyPairs)) {
        throw new Error('keyPairs must be an array containing public keys')
      }

      // Isolate just an array of public keys.
      const pubKeys = []
      for (let i = 0; i < keyPairs.length; i++) {
        const thisPair = keyPairs[i]

        pubKeys.push(thisPair.pubKey)
      }

      // If the number of required signers is not specified, then default to
      // a 50% + 1 threashold.
      if(!requiredSigners) {
        requiredSigners = Math.floor(pubKeys.length / 2) + 1
      }

      // Multisig Address
      const msAddr = new bitcore.Address(pubKeys, requiredSigners)

      // Locking Script in hex representation.
      const scriptHex = new bitcore.Script(msAddr).toHex()

      const walletObj = {
        address: msAddr.toString(),
        scriptHex,
        publicKeys: pubKeys,
        requiredSigners
      }

      return walletObj
    } catch (err) {
      console.error('Error in createMultisigWallet()')
      throw err
    }
  }
}

module.exports = MultisigApproval
