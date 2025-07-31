// anomaly-agent.js
// Scans booking data and detects unusual spikes using simple statistics.
// Output is a list of anomalies with explanatory reasons.
// Logs actions to data/logs.json for traceability.

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

function stats(counts) {
  const values = Object.values(counts);
  const n = values.length;
  if (n < 3) return { mean: 0, sd: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  return { mean, sd: Math.sqrt(variance) };
}

function analyzeDimension(name, counts) {
  const { mean, sd } = stats(counts);
  if (!sd) return [];
  const anomalies = [];
  Object.entries(counts).forEach(([label, count]) => {
    const z = (count - mean) / sd;
    if (Math.abs(z) >= 2) {
      const percent = mean ? (((count - mean) / mean) * 100).toFixed(0) : '0';
      const direction = count > mean ? 'increased' : 'decreased';
      const labelText = name === 'day' ? label : `${label}`;
      anomalies.push({
        dimension: name,
        label,
        count,
        reason: `${labelText} bookings ${direction} by ${Math.abs(percent)}% vs average`
      });
    }
  });
  return anomalies;
}

function detectAnomalies(bookings) {
  if (!Array.isArray(bookings) || bookings.length < 3) {
    return [];
  }
  const dayCounts = {};
  const classCounts = {};
  const instructorCounts = {};

  bookings.forEach(b => {
    if (b.date) {
      const day = new Date(b.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
    if (b.classType) {
      classCounts[b.classType] = (classCounts[b.classType] || 0) + 1;
    }
    if (b.instructor) {
      instructorCounts[b.instructor] = (instructorCounts[b.instructor] || 0) + 1;
    }
  });

  const anomalies = [
    ...analyzeDimension('day', dayCounts),
    ...analyzeDimension('class', classCounts),
    ...analyzeDimension('instructor', instructorCounts)
  ];

  return anomalies;
}

function run() {
  const bookings = readJson(bookingsFile);
  const anomalies = detectAnomalies(bookings);
  if (anomalies.length) {
    logAction('anomaly_detected', JSON.stringify(anomalies));
    console.log(JSON.stringify(anomalies, null, 2));
  } else {
    console.log('No anomalies found');
  }
}

if (require.main === module) {
  run();
}

module.exports = { run, detectAnomalies };
