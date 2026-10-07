# Mesa Migrate

`mesa-migrate` is a conservative migration scanner for o1js applications moving
from pre-Mesa releases to o1js 3.x.

It reports only rules that have an explicit upstream o1js 3.0.0 migration
source. A clean report does not prove an application is Mesa-compatible.

## Current checks

- `MESA001`: `Transaction.setFeePerSnarkCost()` was removed.
- `MESA002`: `TransactionCost` constants were removed.

Each rule links to the o1js 3.0.0 changelog. More complex changes, including
verification-key regeneration and state-model changes, require a human review
and are deliberately not guessed by this early version.

## Usage

```sh
npm test
node ./src/cli.js scan /path/to/zkapp
node ./src/cli.js scan /path/to/zkapp --format json
```

## Status

This is an early proof of concept. It does not submit transactions, read private
keys, or contact a Mina node.

## Source

Rules are based on the [o1js 3.0.0 changelog](https://github.com/o1-labs/o1js/blob/main/CHANGELOG.md#300---2026-08-18).

## License

MIT. See [LICENSE](./LICENSE).
