import { estimateNas } from "./nas-budget.mjs";

const form = document.querySelector("#nas-form");
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const tb = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const tib = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const money = (cents) => usd.format(cents / 100);
const setText = (id, value) => { document.getElementById(id).textContent = value; };

function updateEstimate() {
  const fields = form.elements;
  const result = estimateNas({
    budgetCents: Math.round(fields.budget.valueAsNumber * 100),
    enclosureCents: Math.round(fields.enclosure.valueAsNumber * 100),
    pricePerDriveCents: Math.round(fields["drive-price"].valueAsNumber * 100),
    capacityPerDriveTB: fields["drive-capacity"].valueAsNumber,
    mode: fields.mode.value,
  });

  setText("subtotal", money(result.subtotalCents));
  setText("drive-cost", money(result.driveCostCents));
  setText("enclosure-budget", money(result.enclosureBudgetCents));
  setText("raw-capacity", `${tb.format(result.rawTB)} TB`);
  const capacityInTiB = result.usableTiB < 0.005 ? "less than 0.01" : tib.format(result.usableTiB);
  setText("usable-capacity", `${tb.format(result.usableTB)} TB (${capacityInTiB} TiB)`);

  let status = "Exactly on budget";
  if (result.headroomCents > 0) {
    status = `Within budget by ${money(result.headroomCents)}`;
  } else if (result.headroomCents < 0) {
    status = `Over budget by ${money(-result.headroomCents)}`;
  }
  setText("budget-status", status);
  document.getElementById("budget-status").classList.toggle("over-budget", result.headroomCents < 0);

  let note = result.driveCount === 2
    ? "Two identical drives mirror the same data."
    : "This estimate uses a single drive.";
  if (result.drivesOverBudgetCents > 0) {
    note = `The drives alone exceed the budget by ${money(result.drivesOverBudgetCents)}.`;
  }
  setText("subtraction-note", note);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  updateEstimate();
});

form.querySelector("button").disabled = false;
if (form.checkValidity()) updateEstimate();
