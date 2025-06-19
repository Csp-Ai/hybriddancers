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

Open the file in your browser (or deploy it alongside the site) and sign in to access these tools.




## 📚 Documentation

- [System Architecture](docs/architecture.md)
- [Roadmap Checklist](docs/ROADMAP_CHECKLIST.md)


