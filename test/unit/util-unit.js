/*
  Unit tests for the util.js utility library.
*/

// npm libraries
import { assert } from 'chai'
import sinon from 'sinon'
// import cloneDeep from 'lodash.clonedeep'
import SlpWallet from 'minimal-slp-wallet'

// Local libraries
// import mockDataLib from './mocks/util-mocks.js'

// Unit under test
import UtilLib from '../../lib/util.js'

describe('#Util', () => {
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

    uut = new UtilLib({ wallet })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if wallet is not passed', () => {
      try {
        uut = new UtilLib()
        console.log('uut: ', uut)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Instance of minimal-slp-wallet must be passed in as a property called \'wallet\', when initializing the util library.')
      }
    })
  })

  describe('#getTxData', () => {
    it('should get TX data from the full node', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.wallet, 'getTxData').resolves([{ txid: 'fake-txid' }])

      const txid = 'fake-txid'

      const result = await uut.getTxData(txid)
      // console.log('result: ', result)

      assert.equal(result.txid, 'fake-txid')
    })

    it('should get TX data from the cache', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.wallet, 'getTxData').rejects(new Error('test error'))
      uut.txCache['fake-txid'] = { txid: 'fake-txid' }

      const txid = 'fake-txid'

      const result = await uut.getTxData(txid)
      // console.log('result: ', result)

      // Assert expected result
      assert.equal(result.txid, 'fake-txid')
    })

    it('should catch, report, and throw an error', async () => {
      try {
        await uut.getTxData()

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log('err.message: ', err.message)
        assert.include(err.message, 'txid (transactoin ID) required')
      }
    })
  })
})
