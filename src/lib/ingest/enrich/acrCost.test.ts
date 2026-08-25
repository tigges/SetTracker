import assert from "node:assert/strict";
import {
  acrDisclosure,
  acrPlanAnnounced,
  acrSpendConfirmed,
  announceAcrPlan,
  assertAcrSpendAllowed,
  estimateAcrFileScanSpend,
  estimateAcrIdentifySpend,
  formatAcrPlan,
  formatAcrPlanMarkdown,
  resetAcrPlanForTests,
} from "./acrCost";

assert.equal(acrSpendConfirmed({}), false);
assert.equal(acrSpendConfirmed({ ACRCLOUD_CONFIRM_SPEND: "0" }), false);
assert.equal(acrSpendConfirmed({ ACRCLOUD_CONFIRM_SPEND: "1" }), true);
assert.equal(acrSpendConfirmed({ ACRCLOUD_CONFIRM_SPEND: "yes" }), true);

// Worst case = every set burns its probe budget.
const identify = estimateAcrIdentifySpend({
  sets: 20,
  probesPerSet: 12,
  env: {},
});
assert.equal(identify.units, 240);
assert.equal(Number(identify.usdLow.toFixed(2)), 0.48);
assert.equal(Number(identify.usdHigh.toFixed(2)), 1.44);
assert.match(identify.summary, /up to 240 clips \(20 sets × 12\)/);

// Plan rates are overridable so the estimate can match the real bill.
const priced = estimateAcrIdentifySpend({
  sets: 10,
  probesPerSet: 10,
  env: { ACR_USD_PER_IDENTIFY_LOW: "0.01", ACR_USD_PER_IDENTIFY_HIGH: "0.02" },
});
assert.equal(Number(priced.usdLow.toFixed(2)), 1.0);
assert.equal(Number(priced.usdHigh.toFixed(2)), 2.0);

const fs = estimateAcrFileScanSpend({ videos: 20, env: {} });
assert.equal(fs.units, 20);
assert.equal(Number(fs.usdLow.toFixed(2)), 1.5);
assert.equal(Number(fs.usdHigh.toFixed(2)), 4.5);

assert.match(acrDisclosure("identify").sends, /audio clips/i);
assert.match(acrDisclosure("filescan").sends, /YouTube URL/i);
assert.match(acrDisclosure("identify").writes, /fingerprint/);

const text = formatAcrPlan(identify);
assert.match(text, /nothing has been sent yet/);
assert.match(text, /Researches:/);
assert.match(text, /Sends:/);
assert.match(text, /Writes:/);
assert.match(text, /Estimated cost: ≈ \$0\.48–\$1\.44/);
assert.match(formatAcrPlanMarkdown(fs), /### ACRCloud File Scanning plan/);

// The gate: disclosure and confirmation are both required, per mode.
resetAcrPlanForTests();
assert.equal(acrPlanAnnounced("identify"), false);
assert.throws(
  () => assertAcrSpendAllowed("identify", { ACRCLOUD_CONFIRM_SPEND: "1" }),
  /announceAcrPlan/,
  "confirm alone must not unlock",
);

announceAcrPlan(identify, () => {});
assert.equal(acrPlanAnnounced("identify"), true);
assert.equal(acrPlanAnnounced("filescan"), false, "modes unlock separately");
assert.throws(
  () => assertAcrSpendAllowed("identify", {}),
  /confirm spend/,
  "disclosure alone must not unlock",
);
assertAcrSpendAllowed("identify", { ACRCLOUD_CONFIRM_SPEND: "1" });
assert.throws(
  () => assertAcrSpendAllowed("filescan", { ACRCLOUD_CONFIRM_SPEND: "1" }),
  /announceAcrPlan/,
  "filescan needs its own disclosure",
);

resetAcrPlanForTests();
console.log("acrCost.test.ts ok");
