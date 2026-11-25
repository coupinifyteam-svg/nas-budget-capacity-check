const maxPriceCents = 100_000_000;
const bytesPerTB = 1e12;
const bytesPerTiB = 2 ** 40;

export function estimateNas({ budgetCents, enclosureCents, pricePerDriveCents, capacityPerDriveTB, mode }) {
  for (const [name, cents] of Object.entries({ budgetCents, enclosureCents, pricePerDriveCents })) {
    if (!Number.isSafeInteger(cents) || cents < 0 || cents > maxPriceCents) {
      throw new RangeError(`${name} must be a whole number of cents from 0 to 100,000,000.`);
    }
  }

  if (!Number.isFinite(capacityPerDriveTB) || capacityPerDriveTB <= 0 || capacityPerDriveTB > 1000) {
    throw new RangeError("Drive capacity must be greater than 0 and no more than 1000 TB.");
  }

  if (mode !== "basic" && mode !== "raid1") {
    throw new RangeError('Mode must be "basic" or "raid1".');
  }

  const driveCount = mode === "raid1" ? 2 : 1;
  const driveCostCents = driveCount * pricePerDriveCents;
  const subtotalCents = enclosureCents + driveCostCents;

  return {
    driveCount,
    driveCostCents,
    subtotalCents,
    enclosureBudgetCents: Math.max(0, budgetCents - driveCostCents),
    drivesOverBudgetCents: Math.max(0, driveCostCents - budgetCents),
    headroomCents: budgetCents - subtotalCents,
    rawTB: driveCount * capacityPerDriveTB,
    usableTB: capacityPerDriveTB,
    usableTiB: capacityPerDriveTB * bytesPerTB / bytesPerTiB,
  };
}
