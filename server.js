require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');
const fetchInstagramEmbed = require('./api/fetchInstagramEmbed');

const PORT = process.env.PORT || 4242;
const DOMAIN_URL = process.env.DOMAIN_URL || `http://localhost:${PORT}`;

const app = express();
app.use(express.json());
if (process.env.NODE_ENV !== 'development') {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}
app.use(express.static(path.join(__dirname)));

app.get('/config', (req, res) => {
  res.send({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

app.get('/config.js', (req, res) => {
  res.type('js').send(`window.CONFIG = ${JSON.stringify({
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
  })};`);
});

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
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: { name, email, classType },
      success_url: `${DOMAIN_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN_URL}/cancel.html`,
    });

    logAction('create_checkout_session', session.id);
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

// Instagram oEmbed proxy
app.get('/api/fetchInstagramEmbed', fetchInstagramEmbed);

// Aggregate social feed
app.get('/api/social-feed', async (req, res) => {
  const reels = [
    'https://www.instagram.com/p/CyGZc8UPL2g',
    'https://www.instagram.com/p/CyDyapCrkYZ',
    'https://www.instagram.com/p/Cx7OPawrQxt'
  ];
  try {
    const ig = await Promise.all(
      reels.map(url =>
        fetch(`${req.protocol}://${req.get('host')}/api/fetchInstagramEmbed?url=${encodeURIComponent(url)}`)
          .then(r => r.json())
          .catch(() => ({ html: `<iframe src="${url}/embed" allowfullscreen loading="lazy"></iframe>` }))
      )
    );
    res.json({ instagram: ig });
  } catch (err) {
    res.json({ instagram: reels.map(url => ({ html: `<iframe src="${url}/embed" allowfullscreen loading="lazy"></iframe>` })) });
  }
});

// --- Logs API ---
// Return the raw log entries used by automation agents and admin tools
app.get('/api/logs', (req, res) => {
  const logs = readJson(logsFile);
  res.json(logs);
});

app.post('/api/logs', (req, res) => {
  const { action, details } = req.body || {};
  if (action) {
    logAction(action, details || '');
    res.json({ status: 'logged' });
  } else {
    res.status(400).json({ error: 'action required' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
