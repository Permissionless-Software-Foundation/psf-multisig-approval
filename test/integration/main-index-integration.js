/*
  Integration tests for the main library.
*/

// Global npm libraries
const SlpWallet = require('minimal-slp-wallet')

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
    })
  })
})
