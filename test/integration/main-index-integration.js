/*
  Integration tests for the main library.
*/

// Global npm libraries
const SlpWallet = require('minimal-slp-wallet')
const assert = require('chai').assert

// Local libraries
const MultisigApproval = require('../../index')

describe('#psf-multisig-approval', () => {
  let uut

  before(async () => {
    const wallet = new SlpWallet(undefined, {
      interface: 'consumer-api',
      restURL: 'https://bch-consumer-anacortes-wa-usa.fullstackcash.nl'
    })
    await wallet.walletInfoPromise

    uut = new MultisigApproval({ wallet })
  })

  describe('#getNftHolderInfo', () => {
    it('should get address and pubkeys for Minting Council NFT holders', async () => {
      const result = await uut.getNftHolderInfo()
      console.log('result: ', result)

      // Assert expected properties exist
      assert.property(result, 'keys')
      assert.property(result, 'keysNotFound')

      // Assert that each property is an array.
      assert.isArray(result.keys)
      assert.isArray(result.keysNotFound)
    })
  })

  describe('#createMultisigAddress', () => {
    it('should generate a multisig address from token holder info', async () => {
      const tokenHolderInfo = await uut.getNftHolderInfo()

      const keyPairs = tokenHolderInfo.keys

      const result = await uut.createMultisigAddress({keyPairs})
      // console.log('result: ', result)

      assert.property(result, 'address')
      assert.property(result, 'scriptHex')
      assert.property(result, 'publicKeys')
      assert.property(result, 'requiredSigners')
    })
  })
})
