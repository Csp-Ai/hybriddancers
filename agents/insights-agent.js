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

function getTopDay(bookings) {
  const dayCounts = {};
  bookings.forEach(b => {
    const day = new Date(b.date).toLocaleDateString('en-US', { weekday: 'long' });
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  return Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
}

function getTopClass(bookings) {
  const classCounts = {};
  bookings.forEach(b => {
    classCounts[b.classType] = (classCounts[b.classType] || 0) + 1;
  });
  return Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
}

function getMonthlyTrend(bookings) {
  const monthCounts = {};
  bookings.forEach(b => {
    const month = b.date ? b.date.slice(0, 7) : 'unknown'; // YYYY-MM
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  const months = Object.keys(monthCounts).sort();
  if (months.length < 2) return '';
  const last = monthCounts[months[months.length - 1]];
  const prev = monthCounts[months[months.length - 2]];
  const diff = last - prev;
  return `last_month=${last};prev_month=${prev};diff=${diff}`;
}

async function run() {
  const bookings = await readJson(bookingsFile);
  if (!bookings.length) {
    console.log('No bookings to analyze');
    return;
  }
  const topDay = getTopDay(bookings);
  const topClass = getTopClass(bookings);
  const trend = getMonthlyTrend(bookings);
  const details = `top_day=${topDay};top_class=${topClass}${trend ? ';' + trend : ''}`;
  await logAction('insights_generated', details);
  console.log('Insights:', details);
}

if (require.main === module) {
  run();
}

module.exports = { run };
