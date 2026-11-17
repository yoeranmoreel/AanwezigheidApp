'use strict';

const admin = require('firebase-admin');

const dryRun = process.env.DRY_RUN === 'true';
const hour = Number(new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Amsterdam',
  hour: '2-digit',
  hourCycle: 'h23'
}).format(new Date()));

async function main() {
  // Only perform live resets during the same evening.
  // Never use Firestore timestamps or infer when an employee checked in.
  if (!dryRun && (hour < 18 || hour >= 24)) {
    console.log('Outside evening reset window (18:00-23:59 NL); no changes.');
    return;
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT repository secret.');
  }
  const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (credentials.project_id !== 'aanwezigheid-app') {
    throw new Error('Service account belongs to the wrong Firebase project.');
  }
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
    projectId: 'aanwezigheid-app'
  });
  const db = admin.firestore();
  const snap = await db.collection('actuele_status').where('aanwezig', '==', true).get();
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}; Firestore query succeeded.`);
  if (dryRun || snap.empty) return;

  // Read the current boolean again before updating, without any time metadata.
  for (const item of snap.docs) {
    await db.runTransaction(async tx => {
      const current = await tx.get(item.ref);
      if (current.exists && current.get('aanwezig') === true) {
        tx.update(item.ref, { aanwezig: false });
      }
    });
  }
  console.log('Reset completed successfully.');
}

main().catch(error => {
  console.error('Reset failed:', error.message);
  process.exitCode = 1;
});
