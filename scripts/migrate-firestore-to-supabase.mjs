#!/usr/bin/env node
/**
 * One-time Firestore -> Supabase content migration.
 *
 * Copies: events, teams, eventTeams, matches, gallery, news, homepageContent.
 * (Registrations are NOT copied — the old Google Sheet remains the archive
 * for the chess era; badminton rows are created fresh by the new pipeline.)
 *
 * Usage:
 *   FIREBASE_API_KEY=... FIREBASE_PROJECT_ID=maharahtra-krida-website \
 *   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/migrate-firestore-to-supabase.mjs
 *
 * Reads Firestore via its public REST API (works while the project is still
 * live); writes to Supabase via PostgREST with the service-role key.
 * Firestore Timestamps are converted to ISO strings. Document ids are
 * preserved. Safe to re-run: rows are upserted on id.
 */

const FB_PROJECT = process.env.FIREBASE_PROJECT_ID || "maharahtra-krida-website";
const FB_KEY = process.env.FIREBASE_API_KEY;
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!FB_KEY || !SB_URL || !SB_KEY) {
  console.error("Set FIREBASE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// firestore collection -> supabase table
const MAP = {
  events: "events",
  teams: "teams",
  eventTeams: "event_teams",
  matches: "matches",
  gallery: "gallery",
  news: "news",
  homepageContent: "homepage_content",
};

function fromFsValue(v) {
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue; // ISO string
  if (v.nullValue !== undefined) return null;
  if (v.arrayValue !== undefined) return (v.arrayValue.values || []).map(fromFsValue);
  if (v.mapValue !== undefined) return fromFsDoc(v.mapValue.fields || {});
  return null;
}

function fromFsDoc(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) out[k] = fromFsValue(v);
  return out;
}

async function listCollection(name) {
  const docs = [];
  let pageToken = "";
  do {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents/${name}`
    );
    url.searchParams.set("pageSize", "300");
    url.searchParams.set("key", FB_KEY);
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Firestore list ${name} failed (${res.status}): ${await res.text()}`);
    const body = await res.json();
    for (const d of body.documents || []) {
      const id = d.name.split("/").pop();
      docs.push({ id, ...fromFsDoc(d.fields || {}) });
    }
    pageToken = body.nextPageToken || "";
  } while (pageToken);
  return docs;
}

async function upsert(table, rows) {
  if (rows.length === 0) return;
  const res = await fetch(`${SB_URL}/rest/v1/${table}?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`Supabase upsert ${table} failed (${res.status}): ${await res.text()}`);
}

for (const [coll, table] of Object.entries(MAP)) {
  try {
    const docs = await listCollection(coll);
    await upsert(table, docs);
    console.log(`${coll} -> ${table}: ${docs.length} rows`);
  } catch (e) {
    console.error(`${coll}: ${e.message}`);
  }
}
console.log("Done.");
