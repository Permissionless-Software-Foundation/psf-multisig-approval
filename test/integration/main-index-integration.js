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

  // describe('#getNftHolderInfo', () => {
  //   it('should get address and pubkeys for Minting Council NFT holders', async () => {
  //     const result = await uut.getNftHolderInfo()
  //     console.log('result: ', result)
  //
  //     // Assert expected properties exist
  //     assert.property(result, 'keys')
  //     assert.property(result, 'keysNotFound')
  //
  //     // Assert that each property is an array.
  //     assert.isArray(result.keys)
  //     assert.isArray(result.keysNotFound)
  //   })
  // })
  //
  // describe('#createMultisigAddress', () => {
  //   it('should generate a multisig address from token holder info', async () => {
  //     const tokenHolderInfo = await uut.getNftHolderInfo()
  //
  //     const keys = tokenHolderInfo.keys
  //
  //     const result = await uut.createMultisigAddress({ keys })
  //     // console.log('result: ', result)
  //
  //     assert.property(result, 'address')
  //     assert.property(result, 'scriptHex')
  //     assert.property(result, 'publicKeys')
  //     assert.property(result, 'requiredSigners')
  //   })
  // })

  describe('#getApprovalTx', () => {
    it('should retrieve the latest APPROVAL transaction from an address', async () => {
      const address = 'bitcoincash:qrwe6kxhvu47ve6jvgrf2d93w0q38av7s5xm9xfehr'

      // const result = await uut.getApprovalTx({address})
      const result = await uut.getApprovalTx({ address, filterTxids: ['a63f9fbcc901316e6e89f5a8caaad6b2ab268278b29866c6c22088bd3ab93900'] })
      console.log('result: ', result)

      assert.equal(result.updateTxid.length, 64)
    })
  })
})
