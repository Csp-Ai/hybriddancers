# Hybrid Dancers

This repository contains the public site for Hybrid Dancers.

## Git Setup

To set up the repository locally, run the provided setup script:

```bash
./git-init.sh
```

The script initializes Git and pushes the initial commit to GitHub. Make sure it is executable before running.

## Booking Flow

Clicking any `Book` button on the site will now open `booking.html` where visitors can submit their name, email and desired class. Submitting the form launches a pre-filled email so bookings can be handled manually.

## Site Analyzer

Run `./site_analyzer.py` to inspect the HTML files for missing links and confirm that booking functionality is available.

## Instagram Reels

`index.html` loads the latest reels from the Hybrid Dancers account via the Instagram Graph API. Replace `YOUR_INSTAGRAM_ACCESS_TOKEN` in the script with a valid token to enable this feature.

## User Profiles

Visitors can create a local profile at `profile.html` to track progress and save their Instagram handle. Data is stored in browser `localStorage`.
