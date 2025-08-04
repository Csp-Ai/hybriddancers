const { detectTrends } = require('../agents/trends-agent');

describe('trends-agent', () => {
  test('detects upward trend for Jazz Fusion', () => {
    const bookings = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - (59 - i));
      const date = d.toISOString().slice(0, 10);
      const jazzCount = i < 30 ? 2 : 4;
      for (let j = 0; j < jazzCount; j++) {
        bookings.push({ date, classType: 'Jazz Fusion', instructor: 'Alice' });
      }
      bookings.push({ date, classType: 'Hip Hop', instructor: 'Bob' });
    }

    const results = detectTrends(bookings, [60]);
    expect(results.some(r => r.includes('Jazz Fusion') && r.includes('increased'))).toBe(true);
  });
});

