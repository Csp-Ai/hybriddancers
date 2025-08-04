const { forecastBookings } = require('../agents/forecast-agent');

describe('forecast-agent', () => {
  test('forecasts bookings and sets confidence', () => {
    const bookings = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const date = d.toISOString().slice(0, 10);
      bookings.push({ date, classType: 'Ballet' });
      bookings.push({ date, classType: 'Ballet' });
      if (i < 3) {
        bookings.push({ date, classType: 'Hip Hop' });
      }
    }

    const results = forecastBookings(bookings, 7, 30);

    const ballet = results.find(r => r.classType === 'Ballet');
    expect(ballet).toBeDefined();
    expect(Math.round(ballet.forecast[0])).toBe(2);

    const hiphop = results.find(r => r.classType === 'Hip Hop');
    expect(hiphop).toBeDefined();
    expect(hiphop.confidence).toBe('low');
  });
});

