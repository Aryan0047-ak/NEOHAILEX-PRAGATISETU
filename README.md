# PRAGATI SETU

**Action-closure layer on PAIMANA** — turns late project delay reports into owned, SLA-tracked interventions with proof of closure. Built for the MoSPI (Ministry of Statistics & Programme Implementation) use case: 400+ central projects ≥₹150cr delayed, Flash Reports 30 days late, no owner, no SLA, unverifiable progress claims.

> ⚠️ **All data in this repo is SYNTHETIC** — fabricated for the hackathon demo. No real project data, no ML training, no external APIs.

## The loop

```
DATA → DETECTION → DIAGNOSIS → RECOMMENDATION → DECISION → ACTION → VERIFY
```

**Flagship: the Evidence AI Card** — every anomaly becomes a card with Claim / Evidence / Confidence / Source / Time / Recommendation. A human approves it → a ticket is created with a **14-day SLA** → the owner closes it with **photo/NOC proof** → every step lands in a **hash-chained audit trail**.

## Stack

- **React 18 + Vite 5** — component UI, instant HMR on localhost
- **Plain JS store** (`src/lib/store.js`) — one state object + pub-sub, persisted to `localStorage`; swap for a real backend by replacing `save()`/`load()`
- **Pure domain engine** (`src/lib/engine.js`) — health score, cost-of-delay, anomaly detection, SLA ladder, audit hash chain: unit-testable, framework-free
- **RBAC** — password login (mock), 4 roles: Secretary, Review Officer, Project Officer, Admin
- **EN / हिं toggle** on all UI chrome
- **No external API keys, no ML training, works offline** (single dev dependency chain, static build output)

## Quickstart (localhost)

```bash
npm install
npm run dev        # → http://localhost:5173
```

Other scripts:

```bash
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Demo credentials

| Username    | Password   | Unlocks                        |
|-------------|------------|--------------------------------|
| secy-mospi  | setu123    | Secretary — Command & Brief    |
| ro-triage   | setu123    | Review Officer — Triage & Verify |
| ee-sharma   | setu123    | Project Officer — 5-min Update |
| admin-demo  | admin123   | Admin — Seed & Users           |

## Project structure

```
├── index.html                  # Vite entry
├── package.json / vite.config.js
├── src/
│   ├── main.jsx                # React bootstrap
│   ├── App.jsx                 # Login ⇄ Shell switch
│   ├── index.css               # off-white design tokens
│   ├── data/
│   │   ├── seed.js             # 10 SYNTHETIC demo projects
│   │   └── users.js            # demo RBAC users
│   ├── lib/
│   │   ├── engine.js           # health / SLA / anomalies / hash chain (pure fns)
│   │   ├── store.js            # mock backend: state + actions + persistence
│   │   ├── useStore.js         # React binding
│   │   ├── i18n.js             # EN/हिं dictionary
│   │   ├── i18nToggle.js       # t() accessor
│   │   └── uiBus.js            # modal open/close bus
│   └── components/
│       ├── Login.jsx           # password RBAC screen
│       ├── Shell.jsx           # sidebar, stepper, shared views
│       ├── Command.jsx         # Secretary portfolio heat + triage
│       ├── Brief.jsx           # flash note + DO-letter + print
│       ├── Triage.jsx / Verify.jsx / Escalation.jsx   # Review Officer
│       ├── MyProjects.jsx / PhotoBlocker.jsx          # Project Officer
│       ├── AdminUsers.jsx / SeedData.jsx              # Admin
│       ├── Projects.jsx        # detail: gantt, EVM SVG, docs, feed
│       ├── AICardModal.jsx     # ⭐ flagship Evidence AI Card
│       └── WhatIfModal.jsx     # delay-scenario slider
├── legacy/index.html           # hackathon single-file MVP (v5, kept for reference)
└── docs/                       # architecture & demo script
```

## The 10 synthetic cases

| ID | Project | Delay driver |
|----|---------|--------------|
| P-101 | Bareilly-Moradabad 4-lane | Forest clearance (blocked by P-118) |
| P-118 | Forest Clearance Stage-II | File pending (45d overdue) |
| P-203 | Lucknow Metro Ext 2B | On track (control case) |
| P-310 | Ganga STP Kanpur | Power link (blocked by P-203) |
| P-415 | Rural Fiber Gonda | Billing lag, 88%/40% phys-fin gap |
| P-512 | Rail doubling Sitapur-Burhwal | Land 4ha |
| P-623 | AIIMS Gorakhpur OPD | Monsoon |
| P-704 | PMGSY roads Bahraich | Contractor slow, repeat-text stall |
| P-815 | Smart metering Lucknow | Supply (blocked by P-415) |
| P-920 | Amrit Sarovar desilt | On track (control case) |

## Pushing to GitHub (structured)

```bash
git init                      # if not already a repo
git add .gitignore README.md LICENSE docs/ src/ index.html package.json package-lock.json vite.config.js legacy/
git commit -m "PRAGATI SETU: React+Vite command centre with RBAC, SLA engine, Evidence AI Card"
git branch -M main
git remote add origin https://github.com/<you>/pragati-setu.git
git push -u origin main
```

Suggested repo settings: description *"Action-closure layer on PAIMANA — RBAC command centre for delayed central projects (SYNTHETIC demo)"*, topics: `hackathon`, `react`, `vite`, `govtech`, `dashboard`.

## Roadmap (post-hackathon)

- Real backend (Node/Express or Supabase) replacing the localStorage mock
- SHA-256 audit chain + server-side auth with hashed passwords & JWT sessions
- Geo-tagged photo upload to object storage; map skeleton → real Leaflet view
- Repeat-delay registry: systemic blocker analytics across portfolios
