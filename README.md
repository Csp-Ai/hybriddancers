# 🌟 Hybrid Dancers Website

Welcome to the official repository for **Hybrid Dancers** — a vibrant dance fusion studio based in Tempe, AZ. This site powers our online presence, showcasing class offerings, instructor info, pricing, and community engagement features.

---

## 🚀 Project Overview

This repository contains:

- The **public website** for Hybrid Dancers (`index.html`, `services.html`, etc.)
- A **booking experience** that lets users reserve classes online
- Tools for analyzing and testing site quality
- A Supabase backend replacing Firebase for auth and data
- Automatic deployments to Vercel on every push to `main`

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

### Environment Variables

Copy `.env.example` to `.env` and provide your own credentials for Stripe,
Supabase and email providers. The example file now documents each variable.
For Instagram embeds you'll need an `IG_OEMBED_TOKEN` (a Basic Display token
from Meta). Add this secret to your local `.env` **and** to the Vercel project
so `/api/fetchOEmbed` can proxy requests in production. Our pre-commit hook and
GitHub Actions workflow scan for secrets to help keep them private.


## ⚙️ Runtime Configuration

Client-side scripts expect a global `window.CONFIG` object containing your Stripe and Supabase keys. You can serve these values dynamically from Express by adding a route:

```javascript
app.get('/config.js', (req, res) => {
  res.type('js').send(`window.CONFIG = ${JSON.stringify({
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
  })};`);
});
```

Include the generated `config.js` before your other scripts:

```html
<script src="/config.js"></script>
```

### Social Embeds

Instagram and TikTok posts in the *Social Media Showcase* load via the
`/api/fetchOEmbed` endpoint. Each tile shows a pulsing `.embed-skeleton` until
the embed HTML loads. If the request fails, the page falls back to a simple
iframe. When the query string includes `?debugEmbeds=true` extra debug
information prints to the console and failed tiles display a small message with
the original post URL.

You can hit the endpoint directly during development:

```bash
curl "http://localhost:4242/api/fetchOEmbed?url=https://www.instagram.com/p/POST_ID"
```

It returns the JSON payload returned by Instagram or TikTok and caches results
for one hour on the server.

If embeds refuse to load, verify the URL is correct and that your `IG_OEMBED_TOKEN`
is valid. Some browsers block third-party cookies or iframe scripts which may
prevent rendering. In those cases users can still follow the fallback link.

Test embeds across Chrome, Firefox and Safari on desktop as well as iOS Safari
and Android Chrome. Mobile browsers sometimes sandbox third-party iframes which
can break autoplay or inline playback. Known limitations are documented via the
`embed-error` message when a post cannot be rendered.

## 🌐 Custom Domain with Vercel

Both `hybriddancers.com` and `www.hybriddancers.com` are configured in Vercel. The root domain is marked as **primary** so traffic from `www` or the default `*.vercel.app` URL redirects to the canonical HTTPS site.

Configure DNS with the following records:

| Type   | Host | Value             |
|--------|------|------------------|
| `A`    | `@`  | `76.76.21.21`    |
| `CNAME`| `www`| `cname.vercel-dns.com.` |

After the records propagate Vercel automatically provisions SSL certificates. Custom fallback pages `error.html` (for 404s) and `offline.html` are bundled with the deployment and served when appropriate.

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

All data is tied to your logged in Supabase account. Mock data is used for class lists and events, but it can be replaced with real backend calls.

## 🚀 AI Ops Dashboard

This dashboard is secured through Supabase Auth and only renders for approved admin emails.

`ai-ops-dashboard.html` provides an admin-only overview of the entire project health and business metrics. After Supabase auth verifies an admin email, it summarizes code stats, test coverage and deployment status, displays KPIs (bookings, revenue, signups, issues) with charts, and surfaces AI-driven insights with suggested Copilot prompts. A secure append-only log book records every admin action. Use it as the central operations hub.

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


