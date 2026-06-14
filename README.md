# Safety &amp; Health Information Tool

A mobile-first, **offline-capable** field safety platform for the lift/elevator
industry — Schindler-branded. Field visits, accident investigation (RCA),
operational learning events, predictive SIF intelligence and AcciMap analysis,
all in one installable web app.

> Built as vanilla JS ES modules — **no frameworks, no CDNs, no external fonts** —
> so it runs fully offline on locked-down corporate and field devices.

---

## What it does

- **Overview** — cross-module snapshot: visits, accidents, OLEs, open actions, SIF precursors.
- **Predictive Intelligence** — Energy-Based Safety (EBS) model: risk heatmap, SIF precursors,
  barrier health, pattern mining and an in-browser logistic-regression risk model.
- **Field visits** — digital checklists (SAFE / Safety Inspection / Mini OLE / JHA) with the
  Schindler Hazard Wheel, error traps, photos, compliance scoring and embedded actions.
- **Accident reporting** — energy-based SIF classification, AIP taxonomy and root-cause
  analysis (5 Whys with multiple causal branches, Fishbone, Tripod, TapRooT).
- **OLE** — Operational Learning Events: steps, findings, 4D mapping, variability and the swimlane.
- **AcciMap** — interactive systems-based accident analysis (Rasmussen/Svedung): six
  sociotechnical levels, draggable causal nodes, downward causal arrows, causal-factor marking,
  logic check and SVG/PNG export.
- **Action tracker** — closed-loop CAPA with owners, due dates and escalation.
- **Analysis** — slice field data, trends and drill-downs; CSV/JSON export.

## Highlights

- 📱 **Installable PWA** — Add to Home Screen on iOS/Android, full-screen and offline.
- 🌙 **Light & dark themes**, refined enterprise UI (Linear/Stripe/Vercel altitude).
- 🔒 **Login-gated** when a backend is configured; admin-managed users.
- 💾 **Resilient storage** — IndexedDB with an in-memory fallback for browsers that block storage.
- 🔄 **Optional sync backend** (Node + SQLite, Docker) for shared, multi-device data.

## Run locally

It's a static site — serve the `safety-platform/` folder with any static server:

```bash
cd safety-platform
npx serve .            # or: python3 -m http.server
```

Open the printed URL. No build step.

## Deploy

- **Frontend (free):** GitHub Pages serves `safety-platform/` via
  `.github/workflows/pages.yml`. Make the repo public and the workflow publishes on push.
- **Backend (optional):** `render.yaml` is a Render.com blueprint that builds
  `safety-platform/server/Dockerfile` and gives you an HTTPS API URL. The app stays
  fully usable without it (local-only).

## Install as an app

- **iPhone (Safari):** Share → *Add to Home Screen*.
- **Android (Chrome):** the *Install* prompt appears, or menu → *Install app*.

## Tech

Vanilla JS ES modules · SVG charts · service worker (network-first) · IndexedDB ·
Node + Express + better-sqlite3 backend · zero runtime dependencies in the client.

---

© Schindler branding is used for demonstration purposes.
