# psf-multisig-approval

This is an npm library for node.js. It implements the [PS009 specification for multisignature approval](https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps009-multisig-approval.md).

This library depends on [minimal-slp-wallet](https://www.npmjs.com/package/minimal-slp-wallet). An instance of that library is expected to injected into this this one when instantiated. Here is an example:

```javascript
const SlpWallet = require('minimal-slp-wallet')
const MultisigApproval = require('psf-multisig-approval')
```

# License
[MIT](LICENSE.md)
