'use strict';

const admin = require('firebase-admin');

const dryRun = process.env.DRY_RUN === 'true';
const manual = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
const now = new Date();
const parts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Amsterdam', year: 'numeric', month: '2-digit',
  day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
}).formatToParts(now);
const local = Object.fromEntries(parts.map(({type, value}) => [type, value]));
const hour = Number(local.hour);
const minute = Number(local.minute || 0);
const dayKey = `${local.year}-${local.month}-${local.day}`;

function isDutchSummerTime(day) {
  // Noon UTC on this date safely determines Amsterdam's UTC offset.
  const month = day.getUTCMonth();
  const year = day.getUTCFullYear();
  const lastSunday = m => {
    const last = new Date(Date.UTC(year, m + 1, 0));
    return last.getUTCDate() - last.getUTCDay();
  };
  if (month > 2 && month < 9) return true;
  if (month < 2 || month > 9) return false;
  if (month === 2) return day.getUTCDate() >= lastSunday(2);
  return day.getUTCDate() < lastSunday(9);
}

async function main() {
  // The daily cutoff is 18:00 Amsterdam time. Before 18:00, target yesterday.
  // Firestore updateTime protects check-ins made after the cutoff, including this morning.
  const cutoffDay = new Date(Date.UTC(Number(local.year), Number(local.month) - 1, Number(local.day) - (hour < 18 ? 1 : 0)));
  const cutoffDate = cutoffDay.toISOString().slice(0, 10);
  const cutoff = new Date(`${cutoffDate}T18:00:00${isDutchSummerTime(cutoffDay) ? '+02:00' : '+01:00'}`);
  if (!manual && now.getTime() < cutoff.getTime()) {
    console.log('Reset cutoff not reached; no changes.');
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
  const eligible = snap.docs.filter(item => item.updateTime && item.updateTime.toDate() < cutoff);
  console.log('Reset eligibility check succeeded; recent check-ins are protected.');
  if (dryRun || eligible.length === 0) return;

  // Transactions re-read each document to avoid overwriting check-ins made during the run.
  for (const item of eligible) {
    await db.runTransaction(async tx => {
      const current = await tx.get(item.ref);
      if (current.exists && current.get('aanwezig') === true &&
          current.updateTime && current.updateTime.toDate() < cutoff) {
        tx.update(item.ref, { aanwezig: false });
      }
    });
  }
  console.log('Reset completed successfully.');
}

main().catch(error => { console.error('Reset failed:', error.message); process.exitCode = 1; });
