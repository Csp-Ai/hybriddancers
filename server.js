require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

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

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
