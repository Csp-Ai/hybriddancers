// forecast-agent.js
// Generates 30-day booking forecasts for each class using a simple moving average.
// Designed for clarity and global reuse. Logs results to data/logs.json.

const fs = require('fs');
const path = require('path');

const bookingsFile = path.join(__dirname, '..', 'data', 'bookings.json');
const logFile = path.join(__dirname, '..', 'data', 'logs.json');

// ---------- Utility Functions ----------
// Read JSON from a file. Returns an empty array on error.
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch (e) {
    return [];
  }
}

// Write JSON to a file with indentation for readability.
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Append an action entry to the shared log file.
function logAction(action, details) {
  const logs = readJson(logFile);
  logs.push({ time: new Date().toISOString(), action, details });
  writeJson(logFile, logs);
}

// ---------- Forecast Logic ----------

// Build an array of daily booking counts for the last `lookbackDays` days.
// Each index represents a day relative to today.
function buildDailyCounts(bookings, lookbackDays) {
  const counts = Array(lookbackDays).fill(0);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - lookbackDays + 1);

  bookings.forEach(b => {
    if (!b.date) return;
    const d = new Date(b.date);
    if (d >= start) {
      const idx = Math.floor((d - start) / 86400000);
      if (idx >= 0 && idx < lookbackDays) {
        counts[idx] += 1;
      }
    }
  });
  return counts;
}

// Generate forecast details for a single class.
function forecastForClass(bookings, classType, lookbackDays, horizonDays) {
  const classBookings = bookings.filter(b => b.classType === classType);
  const counts = buildDailyCounts(classBookings, lookbackDays);
  const total = counts.reduce((a, b) => a + b, 0);
  const sampleDays = counts.filter(c => c > 0).length;

  // Fallback: if there is not enough data, return zeros and note the issue.
  if (total === 0 || sampleDays < 3) {
    return {
      classType,
      forecast: Array(horizonDays).fill(0),
      confidence: 'low',
      notes: 'Insufficient recent data; forecast defaults to 0 for all days.'
    };
  }

  const mean = total / lookbackDays;
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / lookbackDays;
  const sd = Math.sqrt(variance);

  let confidence = 'medium';
  if (sampleDays >= 10 && sd / mean < 0.3) confidence = 'high';
  else if (sampleDays < 5) confidence = 'low';

  return {
    classType,
    forecast: Array(horizonDays).fill(parseFloat(mean.toFixed(2))),
    confidence,
    notes: `Forecast uses a ${lookbackDays}-day moving average based on ${sampleDays} days of data.`
  };
}

// Produce forecasts for all classes in the bookings list.
function forecastBookings(bookings, lookbackDays = 30, horizonDays = 30) {
  const classes = Array.from(new Set(bookings.map(b => b.classType).filter(Boolean)));
  return classes.map(c => forecastForClass(bookings, c, lookbackDays, horizonDays));
}

// Run the agent using the stored bookings file and log the results.
function run() {
  const bookings = readJson(bookingsFile);
  if (!bookings.length) {
    console.log('No bookings available for forecasting');
    return;
  }
  const results = forecastBookings(bookings);
  logAction('booking_forecast', JSON.stringify(results));
  console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) {
  run();
}

module.exports = { run, forecastBookings };
