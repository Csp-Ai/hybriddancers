const { detectAnomalies } = require('../agents/anomaly-agent');

describe('anomaly-agent', () => {
  test('detects spikes by day, class, and instructor', () => {
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

    expect(anomalies).toEqual(expect.arrayContaining([
      expect.objectContaining({ dimension: 'day', label: 'Monday' }),
      expect.objectContaining({ dimension: 'class', label: 'Salsa' }),
      expect.objectContaining({ dimension: 'instructor', label: 'Alice' })
    ]));
  });
});

