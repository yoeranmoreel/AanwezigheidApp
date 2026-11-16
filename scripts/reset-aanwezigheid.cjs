'use strict';

const admin = require('firebase-admin');

const dryRun = process.env.DRY_RUN === 'true';
const manual = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
const now = new Date();
const parts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit',
  day: '2-digit', hour: '2-digit', hourCycle: 'h23'
}).formatToParts(now);
const local = Object.fromEntries(parts.map(({type, value}) => [type, value]));
const hour = Number(local.hour);
const dayKey = `${local.year}-${local.month}-${local.day}`;

async function main() {
  if (!manual && (hour < 18 || hour > 23)) {
    console.log('Outside 18:00-23:59 Europe/Amsterdam; no changes.');
    return;
  }
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT repository secret.');
  }
  const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (credentials.project_id !== 'aanwezigheid-app') {
    throw new Error('Service account belongs to the wrong Firebase project.');
  }
  admin.initializeApp({credential: admin.credential.cert(credentials), projectId: 'aanwezigheid-app'});
  const db = admin.firestore();
  const snap = await db.collection('actuele_status').where('aanwezig', '==', true).get();
  console.log(`Date (Amsterdam): ${dayKey}; mode: ${dryRun ? 'DRY RUN' : 'LIVE'}; Firestore query succeeded.`);
  if (dryRun || snap.empty) return;

  let changed = 0;
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = db.batch();
    for (const item of snap.docs.slice(i, i + 400)) {
      batch.update(item.ref, {aanwezig: false});
    }
    await batch.commit();
    changed += Math.min(400, snap.docs.length - i);
  }
  console.log('Reset completed successfully.');
}

main().catch(error => { console.error('Reset failed:', error.message); process.exitCode = 1; });
