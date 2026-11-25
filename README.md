# NAS Budget & Capacity Check

A small JavaScript estimator for the equipment cost and capacity of a one-drive NAS or a two-drive mirror. Enter your own quote to compare the drive costs with your enclosure budget.

## Open the calculator locally

Serve this folder over HTTP and open `index.html`. For example, run `python -m http.server 8000 --bind 127.0.0.1` and visit `http://127.0.0.1:8000/`. The calculator runs locally in the browser and has no runtime dependencies.

## Use the estimator in your own code

```js
import { estimateNas } from "./nas-budget.mjs";

const result = estimateNas({
  budgetCents: 70000,
  enclosureCents: 28000,
  pricePerDriveCents: 20000,
  capacityPerDriveTB: 4,
  mode: "raid1",
});

console.log(result.subtotalCents, result.enclosureBudgetCents, result.usableTB);
// 68000 30000 4
```

Pass prices as integer cents and per-drive capacity as decimal TB. Select `basic` for one drive or `raid1` for two identical drives. The result includes the hardware subtotal, the amount left for the enclosure, any drive-only budget overage, and estimated capacity before formatting or system overhead. Run `node --test examples.mjs` to check the examples and input validation.

See Coupinify's [diskless NAS cost breakdown and drive compatibility checks](https://coupinify.com/blog/diskless-nas-cost) for a worked shopping example.

Calculator source code is available under the [MIT License](LICENSE). The Coupinify name and branding are reserved.
