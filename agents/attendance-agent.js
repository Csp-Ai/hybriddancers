const fs = require('fs');
const path = require('path');
const { logToSupabase } = require('./supabase-log');

const bookingsFile = path.join(__dirname, '..', 'data', 'bookings.json');
const logFile = path.join(__dirname, '..', 'data', 'logs.json');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch (e) {
    return [];
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function logAction(action, details) {
  const logs = readJson(logFile);
  logs.push({ time: new Date().toISOString(), action, details });
  writeJson(logFile, logs);
  logToSupabase(action, details);
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

function run() {
  const bookings = readJson(bookingsFile);
  const anomalies = detectAnomalies(bookings);
  if (anomalies.length) {
    logAction('attendance_anomaly', anomalies.join(','));
    console.log('Anomalies detected:', anomalies.join(','));
  } else {
    console.log('No anomalies detected');
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
