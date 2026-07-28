#!/usr/bin/env node
/**
 * Switch the live Razorpay account by pushing a credential profile to the
 * project's Supabase Edge Function secrets.
 *
 * The three Razorpay secrets exist ONLY as Edge Function secrets — nothing is
 * in the repo, nothing is in netlify.toml, and the publishable key id is not
 * baked into the frontend bundle (create-badminton-order returns it per order).
 * So swapping accounts is purely a secrets change, and this script is the whole
 * switch.
 *
 * Usage:
 *   npm run rzp:status          # which account is live right now?
 *   npm run rzp:use test        # push .razorpay/test.env
 *   npm run rzp:use live        # push .razorpay/live.env (asks for confirmation)
 *
 * Profiles live in .razorpay/<name>.env (gitignored), each holding exactly:
 *   RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
 *   RAZORPAY_KEY_SECRET=xxxxxxxx
 *   RZP_WEBHOOK_SECRET=xxxxxxxx
 *
 * `supabase secrets list` only ever returns SHA-256 digests, never values —
 * which is exactly what makes "which account is live?" answerable: we hash the
 * local profiles and match. No secret is ever printed by this script, and none
 * is passed on a command line (that would leak into argv and shell history);
 * `supabase secrets set --env-file` reads from a 0600 temp file instead.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const KEYS = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RZP_WEBHOOK_SECRET"];
const PROFILE_DIR = ".razorpay";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function die(msg) {
  console.error(`\n  ✗ ${msg}\n`);
  process.exit(1);
}

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** rzp_live_AbCdEf1234 -> "rzp_live_…1234". Never reveals a full key. */
function maskKeyId(keyId) {
  if (!keyId) return "no key id";
  const prefix = keyId.startsWith("rzp_live_")
    ? "rzp_live_"
    : keyId.startsWith("rzp_test_")
      ? "rzp_test_"
      : "";
  return `${prefix}…${keyId.slice(-4)}`;
}

function supabase(args) {
  try {
    return execFileSync("supabase", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    die(`supabase ${args.join(" ")} failed:\n\n${(e.stderr || e.message).trim()}`);
  }
}

function projectRef() {
  const ref = process.env.SUPABASE_PROJECT_REF || readIfExists("supabase/.temp/project-ref");
  if (!ref) die("No linked Supabase project. Run `supabase link` first.");
  return ref.trim();
}

function readIfExists(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

/** Minimal KEY=VALUE parser — enough for a file we also write ourselves. */
function parseEnv(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

/** All .razorpay/*.env files as { name -> { KEY: value } }. */
function loadProfiles() {
  if (!fs.existsSync(PROFILE_DIR)) {
    die(
      `No ${PROFILE_DIR}/ directory.\n    Create ${PROFILE_DIR}/live.env and/or ${PROFILE_DIR}/test.env with:\n` +
        KEYS.map((k) => `      ${k}=...`).join("\n") +
        `\n\n    It is gitignored — the credentials never enter the repo.`
    );
  }
  const profiles = {};
  for (const file of fs.readdirSync(PROFILE_DIR)) {
    if (!file.endsWith(".env")) continue;
    profiles[file.slice(0, -".env".length)] = parseEnv(
      fs.readFileSync(path.join(PROFILE_DIR, file), "utf8")
    );
  }
  if (Object.keys(profiles).length === 0) die(`No *.env profiles in ${PROFILE_DIR}/.`);
  return profiles;
}

function requireComplete(name, profile) {
  const missing = KEYS.filter((k) => !profile[k]);
  if (missing.length) {
    die(`${PROFILE_DIR}/${name}.env is missing: ${missing.join(", ")}`);
  }
  const keyId = profile.RAZORPAY_KEY_ID;
  if (!keyId.startsWith("rzp_live_") && !keyId.startsWith("rzp_test_")) {
    die(
      `${PROFILE_DIR}/${name}.env has a RAZORPAY_KEY_ID that starts with neither ` +
        `rzp_live_ nor rzp_test_ — that is not a Razorpay key id.`
    );
  }
}

/** { KEY: digest } for the three Razorpay secrets currently set on the project. */
function liveDigests() {
  const raw = supabase(["secrets", "list", "-o", "json"]);
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    die(`Could not parse \`supabase secrets list -o json\` output:\n\n${raw.trim()}`);
  }
  // The CLI returns a bare array normally, and {secrets:[...]} under agent mode.
  const rows = Array.isArray(parsed) ? parsed : parsed.secrets || [];
  const digests = {};
  for (const row of rows) {
    if (KEYS.includes(row.name)) digests[row.name] = row.value;
  }
  return digests;
}

/**
 * Per key, which profiles hash to the live digest.
 * Returns { perKey: { KEY: [profileNames] }, active: name|"unknown"|"mixed" }.
 */
function resolveActive(profiles, digests) {
  const perKey = {};
  for (const key of KEYS) {
    perKey[key] = Object.entries(profiles)
      .filter(([, p]) => p[key] && digests[key] && sha256(p[key]) === digests[key])
      .map(([name]) => name);
  }
  const unanimous = Object.keys(profiles).filter((name) =>
    KEYS.every((key) => perKey[key].includes(name))
  );
  // >1 means two profile files hold identical credentials — report them all
  // rather than silently picking one, so a stale duplicate is visible.
  if (unanimous.length >= 1) return { perKey, active: unanimous.sort().join(" = ") };
  const anyMatch = KEYS.some((key) => perKey[key].length > 0);
  return { perKey, active: anyMatch ? "mixed" : "unknown" };
}

function report(profiles, digests, ref) {
  const { perKey, active } = resolveActive(profiles, digests);

  console.log(`\n  project:  ${ref}`);
  console.log(`  profiles: ${Object.keys(profiles).sort().join(", ")}\n`);

  for (const key of KEYS) {
    const owners = perKey[key];
    const label = !digests[key]
      ? "not set on the project"
      : owners.length
        ? owners.join(" / ")
        : "no profile matches";
    console.log(`    ${key.padEnd(20)} ${label}`);
  }

  console.log("");
  if (active === "mixed") {
    console.log(
      "  ⚠ active profile: MIXED — the three secrets do not all come from the\n" +
        "    same profile. A previous switch probably half-completed. Re-run\n" +
        "    `npm run rzp:use <profile>` to put them back in sync."
    );
  } else if (active === "unknown") {
    console.log(
      "  ? active profile: unknown — none of the local profiles match what is\n" +
        "    set on the project. Either the secrets were set outside this script,\n" +
        "    or a profile file is out of date."
    );
  } else {
    // `active` may name several identical profiles ("live = backup"); any of
    // them has the same key id.
    const first = profiles[active.split(" = ")[0]];
    console.log(`  ✓ active profile: ${active}   (${maskKeyId(first.RAZORPAY_KEY_ID)})`);
  }

  console.log(
    `\n  Webhook URL to register in that Razorpay account\n` +
      `  (Settings → Webhooks, subscribe to \`payment.captured\` ONLY):\n` +
      `    https://${ref}.supabase.co/functions/v1/webhooks\n`
  );
  return active;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdStatus() {
  const ref = projectRef();
  report(loadProfiles(), liveDigests(), ref);
}

async function cmdUse(name) {
  const ref = projectRef();
  const profiles = loadProfiles();
  const profile = profiles[name];
  if (!profile) {
    die(`No profile "${name}". Available: ${Object.keys(profiles).sort().join(", ")}`);
  }
  requireComplete(name, profile);

  const keyId = profile.RAZORPAY_KEY_ID;
  const isLive = keyId.startsWith("rzp_live_");

  if (isLive) {
    console.log(
      `\n  ⚠ ${maskKeyId(keyId)} is a LIVE key — real money.\n` +
        `    Every checkout on ${ref} will charge cards for real once this lands.`
    );
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(`\n  Type "live" to confirm: `);
    rl.close();
    if (answer.trim() !== "live") die("Aborted — nothing was changed.");
  }

  // Values go through a 0600 temp file, never through argv.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "rzp-"), { mode: 0o700 });
  const envFile = path.join(dir, "secrets.env");
  try {
    fs.writeFileSync(envFile, KEYS.map((k) => `${k}=${profile[k]}`).join("\n") + "\n", {
      mode: 0o600,
    });
    console.log(`\n  → pushing ${PROFILE_DIR}/${name}.env to ${ref}`);
    supabase(["secrets", "set", "--env-file", envFile]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  // Redeploy so no warm instance keeps serving the previous account's key.
  console.log("  → redeploying create-badminton-order, webhooks");
  supabase(["functions", "deploy", "create-badminton-order", "webhooks"]);

  const active = report(profiles, liveDigests(), ref);
  if (!active.split(" = ").includes(name)) {
    die(
      `Verification FAILED: after pushing "${name}", the live digests report "${active}".\n` +
        `    Do not trust the switch. Either the push did not take, or this script's\n` +
        `    SHA-256 assumption about the digest format is wrong — check by hand with\n` +
        `    \`supabase secrets list\` before taking any payments.`
    );
  }
  console.log(`  ✓ verified: ${name} is live.\n`);
}

// ---------------------------------------------------------------------------

const [command, arg] = process.argv.slice(2);

if (command === "status") {
  cmdStatus();
} else if (command === "use") {
  if (!arg) die("Usage: npm run rzp:use <profile>   (e.g. `npm run rzp:use live`)");
  await cmdUse(arg);
} else {
  die("Usage: npm run rzp:status  |  npm run rzp:use <profile>");
}
