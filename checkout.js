const stripe = Stripe(window.CONFIG?.STRIPE_PUBLIC_KEY || '');

const btn = document.getElementById('pay-class-btn');
if (btn) {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Guest Checkout',
          email: 'guest@example.com',
          classType: 'Class Pack'
        })
      });
      if (!resp.ok) throw new Error('Failed');
      const session = await resp.json();
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (err) {
      console.error(err);
      alert('Unable to start payment. Please try again.');
    }
  });
}
