const stripe = Stripe('YOUR_PUBLIC_STRIPE_KEY'); // Replace with your actual public key

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
