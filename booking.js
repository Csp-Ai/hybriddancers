let stripe;
fetch('/config')
  .then(r => r.json())
  .then(data => {
    stripe = Stripe(data.publishableKey);
  });

document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    email: form.email.value,
    classType: form.classType.value,
  };

  try {
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to start checkout');
    const session = await response.json();
    if (!session.id) throw new Error('Invalid session');

    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, sessionId: session.id })
    });

    showToast('Redirecting to payment...', 'success');
    await stripe.redirectToCheckout({ sessionId: session.id });
  } catch (err) {
    console.error(err);
    showToast('Booking failed. Please try again.', 'error');
  }
});
