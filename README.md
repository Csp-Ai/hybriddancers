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





## 📚 Documentation

- [System Architecture](docs/architecture.md)
- [Roadmap Checklist](docs/ROADMAP_CHECKLIST.md)


