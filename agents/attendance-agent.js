const fs = require('fs').promises;
const path = require('path');
const { logToSupabase } = require('./supabase-log');

const bookingsFile = path.join(__dirname, '..', 'data', 'bookings.json');
const logFile = path.join(__dirname, '..', 'data', 'logs.json');

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (e) {
    return [];
  }
}

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

async function logAction(action, details) {
  const logs = await readJson(logFile);
  logs.push({ time: new Date().toISOString(), action, details });
  await writeJson(logFile, logs);
  await logToSupabase(action, details);
}

function detectAnomalies(bookings) {
  const counts = {};
  bookings.forEach(b => {
    counts[b.date] = (counts[b.date] || 0) + 1;
  });
  const values = Object.values(counts);
  const avg = values.reduce((a,b) => a+b, 0) / (values.length || 1);
  const threshold = avg * 0.5;
  return Object.entries(counts)
    .filter(([,c]) => c < threshold)
    .map(([d]) => d);
}

async function run() {
  const bookings = await readJson(bookingsFile);
  const anomalies = detectAnomalies(bookings);
  if (anomalies.length) {
    await logAction('attendance_anomaly', anomalies.join(','));
    console.log('Anomalies detected:', anomalies.join(','));
  } else {
    console.log('No anomalies detected');
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
