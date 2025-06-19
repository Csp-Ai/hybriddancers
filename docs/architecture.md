# System Architecture

The Hybrid Dancers website is built using a mix of static assets and a lightweight Node.js backend.

- **Static frontend**: HTML, CSS, and JavaScript files served directly for most pages.
- **Authentication**: Firebase Authentication handles user sign up, login, and session state.
- **Payments**: A small Express server integrates with Stripe to create checkout sessions for class bookings.
- **Testing**: Python `pytest` tests verify markup and booking logic under the `tests/` directory.

![Architecture Diagram](placeholder-for-diagram.png)

Additional services like Firebase Hosting provide HTTPS and custom domain management.

