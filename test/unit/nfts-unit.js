/*
  Unit tests for the nfts.js utility library.
*/

// npm libraries
const chai = require('chai')
const sinon = require('sinon')
// const cloneDeep = require('lodash.clonedeep')
const SlpWallet = require('minimal-slp-wallet')

// Locally global variables.
const assert = chai.assert

// Mocking data libraries.
// const mockDataLib = require('./mocks/util-mocks')

// Unit under test
const NftsLib = require('../../lib/nfts')

describe('#NFTs', () => {
  let sandbox
  // let mockData
  let uut
  let wallet

  before(async () => {
    wallet = new SlpWallet(undefined, { interface: 'consumer-api' })
    await wallet.walletInfoPromise
  })

  beforeEach(() => {
    // Restore the sandbox before each test.
    sandbox = sinon.createSandbox()

    // Clone the mock data.
    // mockData = cloneDeep(mockDataLib)

    uut = new NftsLib({ wallet })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if wallet is not passed', () => {
      try {
        uut = new NftsLib()
        console.log('uut: ', uut)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Instance of minimal-slp-wallet must be passed in as a property called \'wallet\', when initializing the nfts.js library.')
      }
    })
  })

  describe('#getNftsFromGroup', () => {
    it('should get NFT token IDs from a Group token', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.wallet, 'getTokenData').resolves({
        genesisData: {
          nfts: ['a', 'b', 'c']
        }
      })

      const result = await uut.getNftsFromGroup('fake-group-id')

      assert.isArray(result)
    })

    it('should catch and throw errors', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.wallet, 'getTokenData').rejects(new Error('test error'))

        await uut.getNftsFromGroup()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#getAddrsFromNfts', () => {
    it('should should return addresses associated with each NFT', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.wallet, 'getTokenData').resolves({
        genesisData: {
          nftHolder: 'sam'
        }
      })

      const nfts = ['a']

      const result = await uut.getAddrsFromNfts(nfts)

      assert.isArray(result)
      assert.equal(result[0], 'sam')
    })

    it('should catch and throw errors', async () => {
      try {
        // Force an error
        sandbox.stub(uut.wallet, 'getTokenData').rejects(new Error('test error'))

        const nfts = ['a']

        await uut.getAddrsFromNfts(nfts)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})
