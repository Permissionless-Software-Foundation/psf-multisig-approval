/*
  Unit tests for the main index.js library file.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
// const cloneDeep = require('lodash.clonedeep')
const SlpWallet = require('minimal-slp-wallet')

// Mocking data libraries.
// const mockDataLib = require('./mocks/util-mocks')

// Unit under test
const MultisigApproval = require('../../index')

describe('#MultisigApproval.js', () => {
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

    uut = new MultisigApproval({ wallet })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if wallet is not passed', () => {
      try {
        uut = new MultisigApproval()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Instance of minimal-slp-wallet must be passed in as a property called \'wallet\', when initializing the psf-multisig-approval library.')
      }
    })

    it('should have encapsulated dependencies', () => {
      assert.property(uut, 'nfts')
    })
  })

  describe('#getNftInfo', () => {
    it('should get info about NFTs associated with a group token', async () => {
      const result = await uut.getNftInfo()

      assert.equal(result, true)
    })

    // it('should catch, report, and throw errors', async () => {
    //   try {
    //
    //   } catch(err) {
    //
    //   }
    // })
  })
})
