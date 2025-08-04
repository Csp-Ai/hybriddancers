const { parseLogs, filterLogs, logsToCsv } = require('../scripts/dashboard-insights.js');

describe('dashboard insights helpers', () => {
  test('parse, filter, and export logs', () => {
    const sampleLogs = [
      { time: '2023-09-01T00:00:00Z', action: 'attendance_anomaly', details: '2023-08-31' },
      { time: '2023-09-02T00:00:00Z', action: 'anomaly_detected', details: '[{"dimension":"class","label":"Salsa"}]' },
      { time: '2023-09-03T00:00:00Z', action: 'booking_forecast', details: '[{"classType":"Salsa","forecast":[5],"confidence":"high"}]' }
    ];

    const parsed = parseLogs(sampleLogs);
    const filtered = filterLogs(parsed, { classType: 'Salsa' });
    expect(filtered).toHaveLength(2);

    const csv = logsToCsv(filtered);
    expect(csv).toContain('Salsa');
  });
});

