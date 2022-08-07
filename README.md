# Dot-Vote-Relayer
Dot-Vote-Relayer relays signatures created on a Dot-Vote website. To use Dot-Vote-Relayer,
import the relayer to your file using `const { Relayer } = require("dot-vote-relayer");`.

Create a config for your relayer which contains the following fields:
- ethRpcUrl
- mongodDbUrl
- governorAddress
- tokenAddress
- governorVoteFunction
- governorGetProposalFunction
- governorGetReceiptFunction
- relayerPk

There is also an optional `notificationHook` field which can be used to send telegram notifications.

The ABI for your governor and governance token must be placed in the root directory and be named `governor.abi` and `token.abi`.

Then start your relayer as follows:

```
const relayer = new Relayer(config);
relayer.start();
```

For an example integration, see [dydx-relayer](https://github.com/arr00/dydx-relayer).