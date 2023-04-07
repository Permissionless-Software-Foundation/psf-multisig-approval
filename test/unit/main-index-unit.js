/*
  Unit tests for the main index.js library file.
*/

// npm libraries
const assert = require('chai').assert
const sinon = require('sinon')
const cloneDeep = require('lodash.clonedeep')
const SlpWallet = require('minimal-slp-wallet')

// Mocking data libraries.

// Local libraries
const MultisigApproval = require('../../index')
const mockDataLib = require('./mocks/main-index-mocks')

describe('#MultisigApproval.js', () => {
  let sandbox
  let mockData
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
    mockData = cloneDeep(mockDataLib)

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

  describe('#getNftHolderInfo', () => {
    it('should get info about NFTs associated with a group token', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.nfts, 'getNftsFromGroup').resolves()
      sandbox.stub(uut.nfts, 'getAddrsFromNfts').resolves()
      sandbox.stub(uut.nfts, 'findKeys').resolves({ keys: [], keysNotFound: [] })

      const result = await uut.getNftHolderInfo()

      assert.property(result, 'keys')
      assert.property(result, 'keysNotFound')
      assert.isArray(result.keys)
      assert.isArray(result.keysNotFound)
    })

    it('should catch, report, and throw errors', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.nfts, 'getNftsFromGroup').rejects(new Error('test error'))

        await uut.getNftHolderInfo()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#createMultisigAddress', () => {
    it('should generate a P2SH multisig address', async () => {
      const result = await uut.createMultisigAddress({ keys: mockData.pubkeys })
      // console.log('result: ', result)

      // Assert that expected properties exist
      assert.property(result, 'address')
      assert.property(result, 'scriptHex')
      assert.property(result, 'publicKeys')
      assert.property(result, 'requiredSigners')

      // Assert that expected address is generated
      assert.equal(result.address, 'bitcoincash:pqntzt6wcp38h8ud68wjnwh437uek76lhvhlwcm4fj')
    })

    it('should catch, report, and throw errors', async () => {
      try {
        await uut.createMultisigAddress()

        assert.fail('unexpected result')
      } catch (err) {
        assert.include(err.message, 'keys must be an array containing public keys')
      }
    })
  })
})
