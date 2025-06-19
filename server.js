require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const bookingsFile = path.join(__dirname, 'data', 'bookings.json');
const logsFile = path.join(__dirname, 'data', 'logs.json');

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
  const logs = readJson(logsFile);
  logs.push({ time: new Date().toISOString(), action, details });
  writeJson(logsFile, logs);
}

app.post('/create-checkout-session', async (req, res) => {
  const { name, email, classType } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${classType} - Drop-In Class` },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      metadata: { name, email, classType },
      success_url: 'https://www.hybriddancers.com/thank-you.html',
      cancel_url: 'https://www.hybriddancers.com/booking.html',
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Booking API ---
app.get('/api/bookings', (req, res) => {
  const { email } = req.query;
  const bookings = readJson(bookingsFile);
  const result = email ? bookings.filter(b => b.email === email) : bookings;
  res.json(result);
});

app.post('/api/bookings', (req, res) => {
  const bookings = readJson(bookingsFile);
  const booking = { id: nanoid(), ...req.body, created: new Date().toISOString() };
  bookings.push(booking);
  writeJson(bookingsFile, bookings);
  logAction('create_booking', booking.id);
  res.json(booking);
});

app.delete('/api/bookings/:id', (req, res) => {
  const bookings = readJson(bookingsFile);
  const remaining = bookings.filter(b => b.id !== req.params.id);
  if (remaining.length === bookings.length) {
    return res.status(404).json({ error: 'Not found' });
  }
  writeJson(bookingsFile, remaining);
  logAction('delete_booking', req.params.id);
  res.json({ id: req.params.id });
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
