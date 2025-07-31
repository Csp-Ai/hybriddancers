# 🌟 Hybrid Dancers Website

Welcome to the official repository for **Hybrid Dancers** — a vibrant dance fusion studio based in Tempe, AZ. This site powers our online presence, showcasing class offerings, instructor info, pricing, and community engagement features.

---

## 🚀 Project Overview

This repository contains:

- The **public website** for Hybrid Dancers (`index.html`, `services.html`, etc.)
- A **booking experience** that lets users reserve classes online
- Tools for analyzing and testing site quality

The site is designed for maximum impact on both desktop and mobile, prioritizing **clarity, accessibility, and conversion**.

---

## 🧪 Testing the Site

To verify UI structure and functionality:

```bash
pip install -r requirements.txt
pytest
```

To run the booking server with Stripe Checkout:

```bash
npm install
npm start
```

### Booking API

The Express server now stores bookings in `data/bookings.json` and exposes a small API:

- `GET /api/bookings` – list all bookings or filter by `?email=`
- `POST /api/bookings` – create a new booking
- `DELETE /api/bookings/:id` – cancel a booking

Agent scripts under `agents/` can analyze this data. Run `node agents/attendance-agent.js` to log attendance anomalies.

### Email Confirmation Setup

`functions/registerForClass` sends confirmation emails via Nodemailer after saving a registration. Provide credentials for one of the services below:

#### Gmail
- GMAIL_USER – your Gmail address
- GMAIL_PASS – app password for the account

#### SendGrid
- SENDGRID_API_KEY – your SendGrid API key

Optionally set EMAIL_FROM to override the sender address.
Set ADMIN_EMAIL to receive the daily signup summary from `functions/dailyClassSummary`.


## ⚙️ Runtime Configuration

Client-side scripts expect a global `window.CONFIG` object containing your Stripe and Firebase keys. You can serve these values dynamically from Express by adding a route:

```javascript
app.get('/config.js', (req, res) => {
  res.type('js').send(`window.CONFIG = ${JSON.stringify({
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID
  })};`);
});
```

Include the generated `config.js` before your other scripts:

```html
<script src="/config.js"></script>
```

## 🌐 Custom Domain with Firebase Hosting

To serve the site on `www.hybriddancers.com`, configure your DNS records as follows:

| Type | Host | Value |
|------|------|-------|
| `A`  | `@`  | `199.36.158.100` |
| `A`  | `www`| `199.36.158.100` |

Remove any existing records that point to GitHub Pages or other providers (for example the `185.199.x.x` records or a `CNAME` to `csp-ai.github.io`). After updating, allow DNS to propagate and let Firebase provision the SSL certificate. Once verification is complete, `https://www.hybriddancers.com` will load securely.

## 🛠️ Admin Dashboard

`admin-dashboard.html` provides a private dashboard for studio administrators. After logging in with an approved admin account you can:

- Review a table of the latest bookings
- Track key metrics like monthly totals, revenue and most popular class
- View attendance trends in an interactive chart
- Read automatically generated **AI Insights** suggesting scheduling and retention improvements
- Inspect recent system logs for troubleshooting

Open the file in your browser (or deploy it alongside the site) and sign in to access these tools.

## 📊 Insights Dashboard

`dashboard-insights.html` gives administrators a quick view of recent AI agent outputs. The page now includes:

- Charts for anomalies, booking forecasts and attendance patterns powered by Chart.js
- Filters to narrow insights by class, instructor or date range
- Locale-aware timestamps (US/EU) and a CSV export button for further analysis

Load the page after running the agents to explore trends and download the raw data.

## 🎓 Student Dashboard

`student-dashboard.html` lets each student manage their classes and wellbeing. After logging in you can:

- Browse upcoming classes and book a spot
- See your personal schedule and cancel bookings
- View studio events and RSVP
- Track your mood in the Wellness Journal and view trends
- Read simple **AI Insights** about your attendance and mood

All data is tied to your logged in Firebase account. Mock data is used for class lists and events, but it can be replaced with real backend calls.

## 🚀 AI Ops Dashboard

This dashboard is secured through Firebase Authentication and only renders for approved admin emails.

`ai-ops-dashboard.html` provides an admin-only overview of the entire project health and business metrics. After Firebase auth verifies an admin email, it summarizes code stats, test coverage and deployment status, displays KPIs (bookings, revenue, signups, issues) with charts, and surfaces AI-driven insights with suggested Copilot prompts. A secure append-only log book records every admin action. Use it as the central operations hub.

### Local access

1. Start the Node server:

   ```bash
   npm install
   npm start
   ```

   or open the project in **Visual Studio Code**, install the **Live Server** extension, and choose *Open with Live Server* on `ai-ops-dashboard.html`.

2. Navigate to `http://localhost:4242/ai-ops-dashboard.html` and sign in with an approved admin account to view the dashboard.





## ⟳ CI/CD Pipeline

Pushing to the `main` branch triggers GitHub Actions to run tests, deploy Supabase migrations and edge functions, and publish the frontend to Vercel. Secrets for Supabase and Vercel must be configured in the repository settings.

## 📚 Documentation

- [System Architecture](docs/architecture.md)
- [Roadmap Checklist](docs/ROADMAP_CHECKLIST.md)


