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
      const result = await uut.createMultisigAddress({ keys: mockData.pubkeys01 })
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

  describe('#getApprovalTx', () => {
    it('should return object with update txid', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.wallet, 'getTransactions').resolves(mockData.txHistory01)
      sandbox.stub(uut.util, 'getTxData').resolves(mockData.approvalTxDetails01)

      const address = 'bitcoincash:fake-addr'

      const result = await uut.getApprovalTx({ address })
      // console.log('result: ', result)

      // Assert that the returned object has the expected properties.
      assert.property(result, 'approvalTxid')
      assert.property(result, 'updateTxid')
      assert.property(result, 'approvalTxDetails')
      assert.property(result, 'opReturn')

      // Assert that TXIDs are returned.
      assert.equal(result.updateTxid.length, 64)
      assert.equal(result.approvalTxid.length, 64)
    })

    it('should handle SLP addresses', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.wallet, 'getTransactions').resolves(mockData.txHistory01)
      sandbox.stub(uut.util, 'getTxData').resolves(mockData.approvalTxDetails01)

      const address = 'simpleledger:qpq4uxk6vc2hn3rw8tevpm570xgs22e6rskpzpenqg'

      const result = await uut.getApprovalTx({ address })
      // console.log('result: ', result)

      // Assert that the returned object has the expected properties.
      assert.property(result, 'approvalTxid')
      assert.property(result, 'updateTxid')
      assert.property(result, 'approvalTxDetails')
      assert.property(result, 'opReturn')

      // Assert that TXIDs are returned.
      assert.equal(result.updateTxid.length, 64)
      assert.equal(result.approvalTxid.length, 64)
    })

    it('should skip a TXID in the filter list', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.wallet, 'getTransactions').resolves(mockData.txHistory02)
      sandbox.stub(uut.util, 'getTxData').resolves(mockData.approvalTxDetails01)

      const address = 'bitcoincash:fake-addr'

      const result = await uut.getApprovalTx({
        address,
        filterTxids: ['095b299da0be5bb2367e62a5628cef603c7d6e709dd72f532632e9c0acf665d3']
      })
      // console.log('result: ', result)

      // Assert that the returned object has the expected properties.
      assert.property(result, 'approvalTxid')
      assert.property(result, 'updateTxid')
      assert.property(result, 'approvalTxDetails')
      assert.property(result, 'opReturn')

      // Assert that TXIDs are returned.
      assert.equal(result.updateTxid.length, 64)
      assert.equal(result.approvalTxid.length, 64)
    })

    it('should skip a TXID if it does contain APPROVAL in the OP_RETURN', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.wallet, 'getTransactions').resolves(mockData.txHistory02)
      sandbox.stub(uut.util, 'getTxData')
        .onCall(0).resolves(mockData.updateTxDetails01)
        .onCall(1).resolves(mockData.approvalTxDetails01)

      const address = 'bitcoincash:fake-addr'

      const result = await uut.getApprovalTx({
        address
      })
      // console.log('result: ', result)

      // Assert that the returned object has the expected properties.
      assert.property(result, 'approvalTxid')
      assert.property(result, 'updateTxid')
      assert.property(result, 'approvalTxDetails')
      assert.property(result, 'opReturn')

      // Assert that TXIDs are returned.
      assert.equal(result.updateTxid.length, 64)
      assert.equal(result.approvalTxid.length, 64)
    })

    it('should return null if approval TX can not be found', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.wallet, 'getTransactions').resolves(mockData.txHistory01)
      sandbox.stub(uut.util, 'getTxData').resolves(mockData.updateTxDetails01)

      const address = 'bitcoincash:fake-addr'

      const result = await uut.getApprovalTx({ address })
      // console.log('result: ', result)

      assert.equal(result, null)
    })

    it('should throw an error if invalid address format is used', async () => {
      try {
        const address = 'fake-addr'

        await uut.getApprovalTx({ address })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Input address must start with bitcoincash: or simpleledger:')
      }
    })
  })
})
