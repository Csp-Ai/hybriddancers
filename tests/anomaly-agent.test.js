const assert = require('assert');
const { detectAnomalies } = require('../agents/anomaly-agent');

// build sample bookings with clear spikes
const bookings = [];
for (let i = 0; i < 20; i++) {
  bookings.push({ date: '2023-09-04', classType: 'Salsa', instructor: 'Alice' });
}
bookings.push({ date: '2023-09-05', classType: 'Hip Hop', instructor: 'Bob' });
bookings.push({ date: '2023-09-06', classType: 'Ballet', instructor: 'Carla' });
bookings.push({ date: '2023-09-07', classType: 'Contemporary', instructor: 'Dan' });
bookings.push({ date: '2023-09-08', classType: 'Jazz', instructor: 'Emma' });
bookings.push({ date: '2023-09-09', classType: 'Tap', instructor: 'Frank' });

const anomalies = detectAnomalies(bookings);

assert.ok(anomalies.some(a => a.dimension === 'day' && a.label === 'Monday'), 'should detect Monday spike');
assert.ok(anomalies.some(a => a.dimension === 'class' && a.label === 'Salsa'), 'should detect Salsa class spike');
assert.ok(anomalies.some(a => a.dimension === 'instructor' && a.label === 'Alice'), 'should detect instructor spike');

console.log('anomaly-agent tests passed');
