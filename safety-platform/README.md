# 🛡️ SafeField — Safety Platform

A **mobile-first, offline-capable safety reporting platform** for field safety
visits, inspired by **Enablon** and built specifically to fix the pain points
collected from the Hubs about the current **SRS** tool.

It runs entirely in the browser — **no backend, no login, no install** — so it
works where safety actually happens: on a phone, on site, with or without a
network connection. It is also an installable **PWA**.

---

## ✨ What it does

| Capability | What you get |
|---|---|
| 📊 **Dashboards** | Live safety cockpit: visits/month, average compliance, open & overdue actions, EBS control coverage, high-energy exposures, top problem areas. Hand-drawn SVG charts (work offline). |
| 📋 **Field visit checklists** | Ready-to-use templates: **SAFE** (New Installation / Transformation, Existing Installation), **Safety Inspection** (EI, NI/TRANS), **Mini OLE**, and a pre-task **JHA**. Each checkpoint is answered _Conform / Variability / N/A_ with a remark. |
| ⚡ **Energy-Based Safety (EBS)** | On each visit you record the **hazardous energies present** (the energy wheel: gravity, motion, electrical, mechanical, pressure, temperature, chemical, radiation, sound, biological), whether a **direct control** targeting the high-energy source is in place, and classify it on the **hierarchy of controls** (elimination → substitution → engineering → administrative → PPE). |
| 🧩 **JHA — Job Hazard Analysis** | A pre-task template: pre-task readiness checklist plus a dynamic **job step → hazard → control → residual risk** table. |
| 📷 **Image attachments** | Attach photo evidence to **any** checkpoint, energy row or action. Images are compressed and stored with the report (no more "PDF without pictures"). |
| 📈 **Data analysis** | Filter by type, city, employee type and date range. Breakdowns of compliance by type / city, Schindler vs subcontractor, most frequent variabilities. **Export to CSV or JSON** — no more reworking raw Excel dumps. |
| ✅ **Closed-loop actions (CAPA)** | Action tracker with owner, due date, status pipeline, **overdue / due-soon escalation flags** and **mass-close**. Actions are generated from visit variabilities. |
| 📴 **Offline-first** | Auto-saves drafts continuously — **pause and resume** a visit any time, even after losing connection. Service worker caches the app shell; IndexedDB stores all data. |

---

## 🩹 How it answers the SRS pain points

From the Hub feedback and the desired-state GAP analysis:

- **No mobile app / web-only / slow** → mobile-first PWA, installable, runs locally and fast.
- **No offline / no auto-save / can't pause a SAFE** → drafts auto-save to IndexedDB; pause & resume.
- **Login excludes subcontractors** → no login at all; "employee type" (Schindler / Subcontractor) is just a field.
- **Photos missing from reports / hard to add** → first-class photo attachments on every checkpoint.
- **Reports are raw Excel, dashboards (Power BI) don't work** → built-in dashboards and clean CSV/JSON export.
- **Weak action management, no escalation, no mass-close** → closed-loop tracker with escalation flags and mass-close.
- **No trend analysis for near misses / findings** → data analysis view with breakdowns and rankings.
- **Static tool, no modern safety methods** → Energy-Based Safety + JHA baked in.

---

## 🚀 Run it

It's all static files. Any static server works. The easiest:

```bash
cd safety-platform
python3 serve.py            # → http://localhost:8000
```

Or with Node:

```bash
npx serve safety-platform
```

Then open the URL on your desktop or phone. On a phone you can **Add to Home
Screen** to install it as an app.

> On first run the platform seeds ~28 sample visits and related actions so the
> dashboards and analytics aren't empty. Reset or wipe the demo data from
> **Settings**.

---

## 🗂️ Project structure

```
safety-platform/
  index.html              App entry
  manifest.webmanifest    PWA manifest
  sw.js                   Service worker (offline app shell)
  serve.py                Tiny static dev server
  assets/icon.svg         App icon
  css/styles.css          Mobile-first styles
  js/
    app.js                Shell + hash router
    db.js                 IndexedDB wrapper
    store.js              Data model, metrics, seed data
    utils.js              Helpers (dates, image compression, CSV, toast…)
    charts.js             Dependency-free SVG charts
    checklists.js         Checklist templates + EBS / control taxonomies
    views/
      dashboard.js        Safety cockpit
      visits.js           Visit list + template picker
      visitForm.js        Visit editor (checklist, EBS, JHA, photos, actions)
      analysis.js         Data analysis & export
      actions.js          Closed-loop action tracker
      settings.js         Backup / restore / reset
```

---

## 🔐 Data & privacy

All data is stored **locally in the browser** (IndexedDB) on the device that
created it. Nothing is sent anywhere. Use **Settings → Export full backup** to
move data between devices, and **Wipe all data** to clear it.

> This is a functional prototype to demonstrate the next-generation safety
> platform capabilities. For a multi-user production rollout it would be paired
> with a sync backend (auth, roles, central reporting), keeping the same
> offline-first, mobile-first front end.
