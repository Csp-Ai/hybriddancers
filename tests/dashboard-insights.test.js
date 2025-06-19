const assert = require('assert');
const { parseLogs, filterLogs, logsToCsv } = require('../scripts/dashboard-insights.js');

const sampleLogs = [
  { time: '2023-09-01T00:00:00Z', action: 'attendance_anomaly', details: '2023-08-31' },
  { time: '2023-09-02T00:00:00Z', action: 'anomaly_detected', details: '[{"dimension":"class","label":"Salsa"}]' },
  { time: '2023-09-03T00:00:00Z', action: 'booking_forecast', details: '[{"classType":"Salsa","forecast":[5],"confidence":"high"}]' }
];

const parsed = parseLogs(sampleLogs);

const filtered = filterLogs(parsed, { classType: 'Salsa' });
assert.strictEqual(filtered.length, 2, 'Filter by class should return matching entries');

const csv = logsToCsv(filtered);
assert.ok(csv.includes('Salsa'), 'CSV should include class type');

console.log('dashboard-insights tests passed');
