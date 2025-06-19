// The Stripe public key should be injected by the server or build tool.
// Fallback to an empty string to avoid accidental key leakage.
const stripe = Stripe(window.STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLIC_KEY || '');

document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    email: form.email.value,
    classType: form.classType.value,
  };

  const response = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const session = await response.json();
  if (session.id) {
    await stripe.redirectToCheckout({ sessionId: session.id });
  }
});
