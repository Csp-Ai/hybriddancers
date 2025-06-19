const fs = require('fs');
const path = require('path');

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
}

function filterBookings(bookings, days) {
  const cutoff = new Date();
  cutoff.setHours(0,0,0,0);
  cutoff.setDate(cutoff.getDate() - days + 1);
  return bookings.filter(b => {
    if (!b.date) return false;
    const d = new Date(b.date);
    return d >= cutoff;
  });
}

function buildSeries(bookings, startDate, days, labelFn) {
  const seriesMap = {};
  bookings.forEach(b => {
    const label = labelFn(b);
    const d = new Date(b.date);
    const idx = Math.floor((d - startDate) / 86400000);
    if (idx >= 0 && idx < days) {
      if (!seriesMap[label]) seriesMap[label] = Array(days).fill(0);
      seriesMap[label][idx] += 1;
    }
  });
  // ensure arrays exist for labels that appear only later
  return seriesMap;
}

function regressionPercent(series) {
  const n = series.length;
  if (n < 2) return 0;
  const sumX = (n - 1) * n / 2;
  const sumX2 = (n - 1) * n * (2 * n - 1) / 6;
  let sumY = 0;
  let sumXY = 0;
  for (let i = 0; i < n; i++) {
    sumY += series[i];
    sumXY += i * series[i];
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const startVal = intercept;
  const endVal = slope * (n - 1) + intercept;
  if (Math.abs(startVal) < 1e-6) return 0;
  return ((endVal - startVal) / Math.abs(startVal)) * 100;
}

function analyzeDimension(bookings, days, labelFn, descriptor) {
  const start = new Date();
  start.setHours(0,0,0,0);
  start.setDate(start.getDate() - days + 1);
  const seriesMap = buildSeries(bookings, start, days, labelFn);
  const summaries = [];
  Object.entries(seriesMap).forEach(([label, series]) => {
    const change = regressionPercent(series);
    if (Math.abs(change) >= 5) {
      const direction = change > 0 ? 'increased' : 'decreased';
      summaries.push(`${label} ${descriptor} ${direction} ${Math.abs(change).toFixed(0)}% over last ${days} days`);
    }
  });
  return summaries;
}

function detectTrends(bookings, periods = [30, 60, 90]) {
  const results = [];
  periods.forEach(days => {
    const recent = filterBookings(bookings, days);
    if (!recent.length) return;
    results.push(...analyzeDimension(recent, days, b => b.classType, 'class bookings'));
    results.push(...analyzeDimension(recent, days, b => new Date(b.date).toLocaleDateString('en-US', { weekday: 'long' }), 'weekday bookings'));
    results.push(...analyzeDimension(recent, days, b => b.instructor, 'instructor bookings'));
  });
  return results;
}

function run() {
  const bookings = readJson(bookingsFile);
  const summaries = detectTrends(bookings);
  if (summaries.length) {
    logAction('trends_analysis', summaries.join(';'));
    console.log('Trends:', summaries.join('\n'));
  } else {
    console.log('No significant trends found');
  }
}

if (require.main === module) {
  run();
}

module.exports = { run, detectTrends };
