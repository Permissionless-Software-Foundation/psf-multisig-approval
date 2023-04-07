/*
  This library implement PS009 specification:
  https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps009-multisig-approval.md
*/

// global libraries
const bitcore = require('bitcore-lib-cash')

// Local libraries
const NFTs = require('./lib/nfts')
const UtilLib = require('./lib/util')

class MultisigApproval {
  constructor (localConfig = {}) {
    this.wallet = localConfig.wallet
    if (!this.wallet) {
      throw new Error('Instance of minimal-slp-wallet must be passed in as a property called \'wallet\', when initializing the psf-multisig-approval library.')
    }

    // Encapsulate dependencies
    this.bchjs = this.wallet.bchjs
    this.nfts = new NFTs(localConfig)
    this.util = new UtilLib(localConfig)

    // Bind the this object to all subfunctions in this class
    this.getNftHolderInfo = this.getNftHolderInfo.bind(this)
    this.createMultisigAddress = this.createMultisigAddress.bind(this)
    this.getApprovalTx = this.getApprovalTx.bind(this)

    // Create a transaction details cache, to reduce the number of API calls.
    this.txCache = {}
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
      const { keys } = inObj
      let requiredSigners = inObj.requiredSigners

      // Input validation
      if (!Array.isArray(keys)) {
        throw new Error('keys must be an array containing public keys')
      }

      // Isolate just an array of public keys.
      const pubKeys = []
      for (let i = 0; i < keys.length; i++) {
        const thisPair = keys[i]

        pubKeys.push(thisPair.pubKey)
      }

      // If the number of required signers is not specified, then default to
      // a 50% + 1 threashold.
      if (!requiredSigners) {
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

  // Given a BCH address, scan its transaction history to find the latest
  // APPROVAL transaction. This function returns the TXID of the UPDATE
  // transaction that the APPROVAL transaction approves.
  // If no APPROVAL transaction can be found, then function returns null.
  // An optional input, filterTxids, is an array of transaction IDs to ignore. This can
  // be used to ignore/skip any known, fake approval transactions.
  async getApprovalTx (inObj = {}) {
    try {
      let address = inObj.address
      const { filterTxids } = inObj

      // Input validation
      if (address.includes('simpleledger:')) {
        address = this.bchjs.SLP.Address.toCashAddress(address)
      }
      if (!address.includes('bitcoincash:')) {
        throw new Error('Input address must start with bitcoincash: or simpleledger:')
      }

      // Get the transaction history for the address
      const txHistory = await this.wallet.getTransactions(address)
      // console.log('txHistory: ', JSON.stringify(txHistory, null, 2))

      // Loop through the transaction history
      for (let i = 0; i < txHistory.length; i++) {
        const thisTxid = txHistory[i]

        // const height = thisTxid.height
        const txid = thisTxid.tx_hash

        // Skip the txid if it is in the filter list.
        if (Array.isArray(filterTxids)) {
          const txidFound = filterTxids.find(x => x === txid)
          // console.log('txidFound: ', txidFound)
          if (txidFound) {
            continue
          }
        }

        // Get the transaction details for the transaction
        const txDetails = await this.util.getTxData(txid)
        // console.log('txDetails: ', JSON.stringify(txDetails, null, 2))
        // console.log(`txid: ${txid}`)

        const out2ascii = Buffer.from(txDetails.vout[0].scriptPubKey.hex, 'hex').toString('ascii')
        // console.log('out2ascii: ', out2ascii)

        // If the first output is not an OP_RETURN, then the tx can be discarded.
        if (!out2ascii.includes('APPROVE')) {
          continue
        }

        const updateTxid = out2ascii.slice(10)
        // console.log('updateTxid: ', updateTxid)

        const outObj = {
          approvalTxid: txid,
          updateTxid,
          approvalTxDetails: txDetails,
          opReturn: out2ascii
        }

        return outObj

        // If the first output is not an OP_RETURN, then the tx can be discarded.
        // if (!txDetails.vout[0].scriptPubKey.asm.includes('OP_RETURN')) {
        //   continue
        // }

        // Convert the asm field into sections
        // const asmSections = txDetails.vout[0].scriptPubKey.asm.split(' ')
        // console.log('asmSections: ', asmSections)
        //
        // // Analyze the second part (the first part that is not OP_RETURN)
        // const part1 = Buffer.from(asmSections[1], 'hex').toString('ascii')
        // console.log('part1: ', part1)
        //
        // if (part1.includes('APPROVE')) {
        //   console.log('Approval transaction detected')
        //   const updateTxid = Buffer.from(asmSections[2], 'hex').toString('ascii')
        //
        //   return updateTxid
        // }
      }

      return null
    } catch (err) {
      console.error('Error in getApprovedData()')
      throw err
    }
  }

  // Given an CID, this function will retrieve the approved data from an IPFS
  // gateway.
  // getCidData()

  // This function will validate the approval transaction. Given the TXID of the
  // approval transaction, and the data from the update transaction, this
  // function will return `true` if a threshold of NFT holders can be verified
  // to have signed the approval transaction. Unless explicitly overridden, the
  // threshold is set by the `requiredSigners` number from the IPFS data.
  // validateApproval()
}

module.exports = MultisigApproval
