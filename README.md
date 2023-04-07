# psf-multisig-approval

This is an npm library for node.js. It implements the [PS009 specification for multisignature approval](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps009-multisig-approval.md).

## Instancing Library
This library depends on [minimal-slp-wallet](https://www.npmjs.com/package/minimal-slp-wallet). An instance of that library is expected to injected into this this one when instantiated. Here is an example:

```javascript
const SlpWallet = require('minimal-slp-wallet')
const MultisigApproval = require('psf-multisig-approval')

async function start() {
  // Instance the BCH wallet
  const wallet = new SlpWallet(undefined, {
    interface: 'consumer-api',
    restURL: 'https://free-bch.fullstack.cash'
  })
  await wallet.initialize()

  // Instance this library
  const ps009 = new MultisigApproval({wallet})
}
start()
```

## Get NFT Holder Information
PS009 uses NFTs as 'homing beacons'. It generates a multisignature wallet from the public keys of the NFT holders. Finding the addresses and public keys of the NFT holders is a foundational feature of the protocol. Here is how you do that:

```javascript
const groupTokenId = '8e8d90ebdb1791d58eba7acd428ff3b1e21c47fb7aba2ba3b5b815aa0fe7d6d5'

const result = await ps009.getNftInfo(groupTokenId)
console.log(result)

/*
{
  keys: [
    {
      addr: 'bitcoincash:qz4zsa22glal5c4jqm748xge657gwuw2d5t9nvg64p',
      pubKey: '021ca211a04a1d489ae77e01c28c97b02e733893890fda00a359ca8956c2e0d259',
      nft: 'e86164aaa06efac1d6453951f67beafe042f0bceb9312845a95355b1e93aa846'
    },
    {
      addr: 'bitcoincash:qpfvh07mdt7yq5czndaz5qq4g9q3m87qpspy7xaxgu',
      pubKey: '0361fd21512b9072e8f6b984d9b04c57e5779867c2ad002999372268770fcb2674',
      nft: 'da7ccbd5e24e468c9e7402489ca9148b5e76e588b73cc4aa4bbf1ca41d5808ab'
    },
    {
      addr: 'bitcoincash:qpsxtzaa7rg677akcc2znpenpsy5jr2ygywmfd45p2',
      pubKey: '03b9bdc40c478ab0536be29c368b26c48a5e8d6867fc34b77c727ab690365aae91',
      nft: '0ec318bede8c2f229db840a24cb63d662ad91e8e6c840e46e6a8ff2d173049ce'
    },
    {
      addr: 'bitcoincash:qqk3aczzggvxnfm7rwm0f9yz20yr00dmpv2f3tasdr',
      pubKey: '033c930d4cff4ba68a70f7a21443e20ad4176173380d21f8c3ce27f7ce947f3246',
      nft: '51624e772adafd7c6a9da38774e4f654282199bd5402e049ee087fc2bd900882'
    },
    {
      addr: 'bitcoincash:qpszha37cjn6n83hpxn7zz5ndaa35vygtcgslxhpuc',
      pubKey: '024be54accec310c2636140336ae548d610ba9b7ce300b3f42494b4a6f2963731f',
      nft: 'e70cc72eeb15c82e96b1f8127d3b138b2fc8ea101fe9c62302ec641c05d4b97d'
    }
  ],
  keysNotFound: []
}
*/
```

If the holder of the NFT has not made any transactions, then their public key will not be on the blockchain. In that case, the NFT and address will be added to the `keysNotFound` array. Those holders will not be included in the multisignature wallet.



# License
[MIT](LICENSE.md)
