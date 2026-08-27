#!/usr/bin/env node
// GATE-1. The blocking production-dependency audit.
//
// WHY THIS IS NOT `npm audit --audit-level=critical` ANY MORE.
//
// `npm audit` exits non-zero for two unrelated reasons and gives you no way to
// tell them apart from the exit code: "your dependencies have a vulnerability
// at or above the threshold", and "I could not reach the advisory service".
// The second one made a BLOCKING step inside a REQUIRED check fail at random --
// measured on 2026-08-27, interleaved against a pristine tree to rule out an
// ordering artefact, at 2/6 and 1/6 runs in one ten-minute window and 0/10 in
// another. It is bursty, not a steady rate.
//
// The transport itself is npm's own fallback chain: `npm audit` POSTs to
// /-/npm/v1/security/advisories/bulk, and when that fails it retries against
// /-/npm/v1/security/audits/quick -- the endpoint npm announces it is retiring
// ("npm notice This endpoint is being retired"). When the fallback fails too,
// npm reports `audit endpoint returned an error` and exits 1, which is
// indistinguishable from a real finding to anything reading exit codes.
//
// So this script reads the REPORT instead of the exit code, and separates three
// outcomes that `npm audit` conflates into one:
//
//   1. A report came back           -> decide on its contents. A finding at or
//                                      above the threshold fails the build.
//   2. No report, transport error   -> retry; if it still will not answer, warn
//                                      loudly and pass. A registry outage is
//                                      not evidence of a vulnerability, and it
//                                      is not evidence of safety either -- the
//                                      warning says exactly that.
//   3. Anything else                -> fail. An unparseable answer means the
//                                      tool is broken rather than the network,
//                                      and that must not be silently tolerated.
//
// Case 2 is the only tolerant path and it can only be reached when there is NO
// report at all. A report that comes back and contains a critical advisory
// still reds the build; tolerance for outages never becomes tolerance for
// vulnerabilities.

import { spawnSync } from "node:child_process";

// Ordered least to most severe. The threshold is the current policy --
// `--audit-level=critical` -- kept deliberately: the production tree carries
// high-severity Angular advisories that are knowingly held back behind epic
// #98, and this card is not the place to change what the gate blocks on.
const SEVERITIES = ["info", "low", "moderate", "high", "critical"];
const THRESHOLD = process.env.AUDIT_LEVEL ?? "critical";
const ATTEMPTS = 3;
const BACKOFF_MS = [2000, 6000];

if (!SEVERITIES.includes(THRESHOLD)) {
  console.error(
    `audit: AUDIT_LEVEL must be one of ${SEVERITIES.join(", ")}, got "${THRESHOLD}"`,
  );
  process.exit(1);
}

const isCI = Boolean(process.env.GITHUB_ACTIONS);
const annotate = (kind, message) => {
  if (isCI) console.log(`::${kind}::${message.replace(/\n/g, "%0A")}`);
};

// Run the same npm that invoked this script, not whatever `npm` resolves to on
// PATH -- npm's own version is part of what this gate is measuring.
const runAudit = () => {
  const execpath = process.env.npm_execpath;
  const [cmd, base] = execpath ? [process.execPath, [execpath]] : ["npm", []];
  return spawnSync(cmd, [...base, "audit", "--omit=dev", "--json"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
};

// Three-way classification. `metadata.vulnerabilities` is what makes an answer
// a report: npm emits it on success and never on the failure paths, where the
// payload is `{ message, error }` with no counts in it.
const classify = (result) => {
  if (result.error) {
    return {
      kind: "broken",
      detail: `could not run npm: ${result.error.message}`,
    };
  }
  const raw = (result.stdout ?? "").trim();
  if (raw === "") {
    return { kind: "broken", detail: "npm produced no output" };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      kind: "broken",
      detail: `npm output was not JSON:\n${raw.slice(0, 2000)}`,
    };
  }
  if (parsed?.metadata?.vulnerabilities) {
    return { kind: "report", report: parsed };
  }
  if (parsed?.message || parsed?.error) {
    return {
      kind: "transport",
      detail: parsed.message ?? JSON.stringify(parsed.error),
    };
  }
  return {
    kind: "broken",
    detail: `unrecognised audit payload:\n${raw.slice(0, 2000)}`,
  };
};

const blocking = SEVERITIES.slice(SEVERITIES.indexOf(THRESHOLD));

const decide = (report) => {
  const counts = report.metadata.vulnerabilities;
  const total = blocking.reduce((sum, level) => sum + (counts[level] ?? 0), 0);
  const tolerated = SEVERITIES.filter((level) => !blocking.includes(level))
    .map((level) => `${counts[level] ?? 0} ${level}`)
    .join(", ");

  if (total === 0) {
    console.log(
      `audit: production tree clean at "${THRESHOLD}" and above. Below threshold, not blocking: ${tolerated}.`,
    );
    return 0;
  }

  const offenders = Object.entries(report.vulnerabilities ?? {})
    .filter(([, v]) => blocking.includes(v.severity))
    .map(([name, v]) => {
      const advisories = (v.via ?? [])
        .filter((entry) => typeof entry === "object" && entry.title)
        .map((entry) => `      ${entry.title} — ${entry.url}`)
        .join("\n");
      return `  ${name} (${v.severity})${advisories ? `\n${advisories}` : ""}`;
    })
    .join("\n");

  console.error(
    `audit: ${total} production vulnerability/vulnerabilities at "${THRESHOLD}" or above:\n${offenders}`,
  );
  annotate(
    "error",
    `Production audit failed: ${total} finding(s) at "${THRESHOLD}" or above.`,
  );
  return 1;
};

let lastTransportDetail = "";

for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
  const outcome = classify(runAudit());

  if (outcome.kind === "report") {
    process.exit(decide(outcome.report));
  }

  if (outcome.kind === "broken") {
    console.error(`audit: the audit tool itself failed — ${outcome.detail}`);
    annotate(
      "error",
      "Production audit could not run. This is not a network error.",
    );
    process.exit(1);
  }

  lastTransportDetail = outcome.detail;
  console.error(
    `audit: attempt ${attempt}/${ATTEMPTS} did not return a report — ${outcome.detail}`,
  );
  if (attempt < ATTEMPTS) {
    const wait = BACKOFF_MS[attempt - 1] ?? BACKOFF_MS.at(-1);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, wait);
  }
}

// Every attempt failed to produce a report. Pass, but say plainly that the
// tree was NOT audited -- a silent pass here would be the same class of bug as
// the flake this card exists to remove.
const message =
  `Production dependencies were NOT audited: the advisory service did not ` +
  `return a report in ${ATTEMPTS} attempts (${lastTransportDetail}). ` +
  `This is a registry availability failure, not a clean result.`;
console.error(`audit: ${message}`);
annotate("warning", message);
process.exit(0);
