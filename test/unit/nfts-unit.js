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
})
