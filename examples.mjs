import assert from "node:assert/strict";
import test from "node:test";
import { estimateNas } from "./nas-budget.mjs";

const example = {
  budgetCents: 70000,
  enclosureCents: 28000,
  pricePerDriveCents: 20000,
  capacityPerDriveTB: 4,
};

test("One 4 TB drive costs $480 and leaves $500 available for the enclosure", () => {
  const result = estimateNas({ ...example, mode: "basic" });
  assert.equal(result.subtotalCents, 48000);
  assert.equal(result.enclosureBudgetCents, 50000);
  assert.equal(result.headroomCents, 22000);
  assert.equal(result.rawTB, 4);
  assert.equal(result.usableTB, 4);
});

test("A two-drive mirror costs $680 and provides about 3.64 TiB before overhead", () => {
  const result = estimateNas({ ...example, mode: "raid1" });
  assert.equal(result.subtotalCents, 68000);
  assert.equal(result.enclosureBudgetCents, 30000);
  assert.equal(result.headroomCents, 2000);
  assert.equal(result.rawTB, 8);
  assert.equal(result.usableTB, 4);
  assert.equal(result.usableTiB.toFixed(2), "3.64");
});

test("Drives that exceed the budget leave zero for the enclosure", () => {
  const result = estimateNas({
    ...example,
    budgetCents: 30000,
    enclosureCents: 0,
    pricePerDriveCents: 18000,
    mode: "raid1",
  });
  assert.equal(result.enclosureBudgetCents, 0);
  assert.equal(result.drivesOverBudgetCents, 6000);
  assert.equal(result.headroomCents, -6000);
});

test("Whole cents preserve an exact budget match", () => {
  const result = estimateNas({
    ...example,
    budgetCents: 76997,
    enclosureCents: 34999,
    pricePerDriveCents: 20999,
    mode: "raid1",
  });
  assert.equal(result.subtotalCents, 76997);
  assert.equal(result.headroomCents, 0);
});

test("Invalid input is rejected", () => {
  assert.throws(() => estimateNas({ ...example, mode: "unknown" }), RangeError);
  assert.throws(() => estimateNas({ ...example, pricePerDriveCents: 10.1, mode: "basic" }), RangeError);
  assert.throws(() => estimateNas({ ...example, capacityPerDriveTB: 0, mode: "raid1" }), RangeError);
});
