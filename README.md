<div align="center">

<h1>🏛️ PRAGATI SETU — प्रगति सेतु</h1>
<h3>Web-Based Integrated Project Monitoring Platform</h3>

<p>
  <img src="https://img.shields.io/badge/Problem%20Statement-SIH26103-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Theme-Smart%20Automation-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Organisation-MoSPI%20%7C%20GoI-darkgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Category-Software-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Hackathon-SIH%202026-red?style=for-the-badge" />
</p>

<p>
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&style=flat-square" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&style=flat-square" />
  <img src="https://img.shields.io/badge/Offline%20First-%E2%9C%85-success?style=flat-square" />
  <img src="https://img.shields.io/badge/No%20API%20Keys-%E2%9C%85-success?style=flat-square" />
  <img src="https://img.shields.io/badge/Bilingual-EN%20%2F%20%E0%A4%B9%E0%A4%BF%E0%A4%82-blue?style=flat-square" />
</p>

> **⚠️ All data in this repository is 100% SYNTHETIC** — fabricated exclusively for the hackathon demonstration. No real project data, no real government records, no external APIs.

</div>

---

## 📋 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Our Solution](#-our-solution)
3. [The Action Loop](#-the-7-stage-action-loop)
4. [Key Features](#-key-features)
5. [Tech Stack](#-tech-stack)
6. [Architecture](#-architecture)
7. [RBAC — Role-Based Access](#-rbac--role-based-access-control)
8. [Anomaly Detection Engine](#-anomaly-detection-engine)
9. [Escalation Ladder](#-escalation-ladder)
10. [Demo Credentials](#-demo-credentials)
11. [Quickstart](#-quickstart)
12. [Project Structure](#-project-structure)
13. [Synthetic Demo Dataset](#-synthetic-demo-dataset)
14. [Roadmap](#-roadmap-post-hackathon)
15. [Team](#-team)

---

## 🎯 Problem Statement

**ID:** `SIH26103` &nbsp;|&nbsp; **Organisation:** MOSPI (Ministry of Statistics & Programme Implementation), Government of India &nbsp;|&nbsp; **Theme:** Smart Automation

> *"Design a web-based integrated platform for real-time monitoring, tracking, and intervention management of centrally sponsored / central sector infrastructure projects above ₹150 crore."*

### The Real Pain

| Problem | Impact |
|---------|--------|
| 400+ central projects (≥ ₹150 cr) are delayed | Crores in taxpayer money locked |
| Flash Reports arrive **30 days late** | No real-time visibility for decision-makers |
| No assigned owner for delays | Nobody is accountable |
| No SLA on interventions | Actions are opened, never closed |
| Progress claims are **unverifiable** | Physical % ≠ Financial %, photos missing |
| No tamper-proof audit trail | Decisions are disputed with no proof |

---

## 💡 Our Solution

**PRAGATI SETU** (Bridge of Progress) is a role-based command centre that sits on top of existing PAIMANA data and converts delay reports into **owned, SLA-tracked interventions with proof of closure**.

```
Raw data → Anomaly Detection → AI Evidence Card → Approved Ticket → Field Closure with Proof → Hash-chained Audit
```

Every delay becomes a ticket. Every ticket has an owner. Every closure requires proof. Every action is logged in a tamper-evident chain.

---

## 🔄 The 7-Stage Action Loop

```
┌──────────┐   ┌───────────┐   ┌───────────┐   ┌────────────────┐
│  1 DATA  │──▶│ 2 DETECT  │──▶│ 3 DIAGNOSE│──▶│ 4 RECOMMEND    │
│ Projects │   │ Anomalies │   │ Risk score│   │ Evidence Card  │
└──────────┘   └───────────┘   └───────────┘   └───────┬────────┘
                                                        │
┌──────────┐   ┌───────────┐   ┌───────────┐           │
│ 7 VERIFY │◀──│ 6 ACTION  │◀──│ 5 DECISION│◀──────────┘
│ Audit    │   │ Proof/NOC │   │ Secretary │
└──────────┘   └───────────┘   └───────────┘
```

Each stage maps to a dedicated view in the platform. Judges can click through every stage sequentially using the stepper bar at the top of the dashboard.

---

## ✨ Key Features

### 🃏 Evidence AI Card (Flagship Feature)
Every detected anomaly becomes a structured card containing:
- **Claim** — what the project officer reported
- **Evidence** — what the system detected (phys-fin gap, missing photo, repeat text)
- **Confidence Score** — rule-based risk assessment
- **Source** — the data point that triggered the flag
- **Recommended Action** — pre-drafted DO-letter text
- **Decision buttons** — Secretary approves → 14-day SLA ticket is created instantly

### 📊 Command Dashboard (Secretary View)
- Portfolio heat map — every project colour-coded by health score
- Cost-of-delay calculator (₹cr per week)
- One-click triage sorted by risk × cost
- Live ops simulation mode (auto-advances the demo clock every 8 seconds)

### 🗺️ Portfolio Map
- SVG map of Uttar Pradesh with project pins
- Pin size = project cost (₹cr), pin colour = health status
- Click any pin → jump straight to project detail

### 🕸️ Dependency Graph
- Cross-project blockage graph (SVG)
- Red dashed edge = blocked dependency (source project is CRITICAL)
- Click any node → open Evidence AI Card for that project

### 🔍 Triage Queue (Review Officer)
- Anomaly-first review desk
- Flag false reporting, route to AI Card
- Ground-truth claim verification

### ⏰ SLA & Escalation Ladder
- 14-day SLA clock on every intervention ticket
- Automated escalation: `T-2d reminder → T-0 red alert → +3d Secretary → +7d Systemic`

### 📷 Photo & Blocker Registration (Project Officer)
- Geo-tagged photo proof upload simulation
- Blocker registration with cross-project dependency tracking

### 🧾 Hash-Chained Audit Trail
- Every action (approve, escalate, close, flag) is logged
- Deterministic hash chain links each entry to the previous
- Tamper-evident: breaking any link is instantly detected

### 🌐 Bilingual Interface
- Full English / हिंदी toggle on all UI chrome
- Bilingual labels, buttons, and section headings

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React 18.3 + Vite 5.4 | Fast SPA with instant HMR |
| **State Management** | Custom pub-sub store (`store.js`) | Single state object, localStorage persistence |
| **Domain Engine** | Pure JS (`engine.js`) | Health scores, SLA, anomalies, forecasting — no React, fully unit-testable |
| **Auth** | Mock RBAC (`users.js`) | 4 roles, password login, session in localStorage |
| **Visualisations** | Inline SVG | Gantt chart, EVM burn curve, portfolio map, dependency graph |
| **i18n** | Custom dictionary (`i18n.js`) | EN / हिं with `t()` accessor |
| **Persistence** | localStorage | Swap `store.js` internals for a real REST/GraphQL API |
| **Build** | Vite static build | `dist/` — deployable to any CDN or static host |

**Zero external runtime dependencies** — only `react` + `react-dom`. Works fully offline.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│           components/   React views (role-gated)        │
├─────────────────────────────────────────────────────────┤
│   lib/uiBus.js  (modal events)    lib/useStore.js       │
├─────────────────────────────────────────────────────────┤
│   lib/store.js  state + actions + persistence           │  ← swap for real API
├─────────────────────────────────────────────────────────┤
│   lib/engine.js  pure domain logic (no React)           │
├─────────────────────────────────────────────────────────┤
│   data/          seed projects + demo RBAC users        │
└─────────────────────────────────────────────────────────┘
```

**Design Rule:** Components never touch `localStorage` and never compute health/SLA themselves. They call *actions* (`approveCard`, `submitProof`, `closeTicket`, …) and read *derived values* from `lib/engine.js`. This makes the domain logic fully portable to a server and unit-testable without a DOM.

---

## 👥 RBAC — Role-Based Access Control

| Capability | Secretary | Review Officer | Project Officer | Admin |
|---|:---:|:---:|:---:|:---:|
| Command heat map / portfolio triage | ✅ | — | — | — |
| Approve Evidence AI Card → create ticket | ✅ | — | — | — |
| Brief + DO-Letter (print-ready PDF) | ✅ | — | — | — |
| Triage queue / flag false reporting | — | ✅ | — | — |
| Verify progress claims | — | ✅ | — | — |
| SLA & escalation view | — | ✅ | — | — |
| 5-minute field update | — | — | ✅ | — |
| Photo proof + blocker registration | — | — | ✅ | — |
| Users / seed / purge / export | — | — | — | ✅ |
| Projects / Dependencies / Tickets / Audit | ✅ | ✅ | ✅ | ✅ |

---

## 🔬 Anomaly Detection Engine

Rule-based anomaly detectors (no ML, no training data required):

| # | Detector | Trigger |
|---|----------|---------|
| 1 | **Phys-Fin Gap** | Physical % − Financial % > 15 → over-claiming signal |
| 2 | **No-Photo Claim** | ≥ 60% progress reported with no geo-tagged photo |
| 3 | **Repeat-Text Stall** | Identical update text submitted ≥ 2 times |
| 4 | **Chronic Overdue** | > 30 days past milestone deadline |
| 5 | **RO Flag** | Review Officer manually flags false reporting |

**Health Score Formula:**

```
H = 100 − (overdue × 1.2) − (|phys − fin| × 0.8) − (no_photo ? 9 : 0)
        − (stall ? 7 : 0) − (flagged ? 10 : 0)
H = max(4, round(H))
```

| Score | Status | Action |
|-------|--------|--------|
| H ≥ 70 | 🟢 ON TRACK | Monitor |
| 45 ≤ H < 70 | 🟡 AT RISK | Review Officer triage |
| H < 45 | 🔴 CRITICAL | Evidence AI Card → Secretary approval |

---

## ⏰ Escalation Ladder

```
SLA Created (Day 0)
     │
     ├── Day 12 (T-2d): ⚠️  Amber — "SLA 2d left" reminder to owner
     │
     ├── Day 14 (T-0): 🔴  Red — "DUE" alert to owner + Review Officer
     │
     ├── Day 17 (+3d): 🔴  "OVERDUE" — Auto-escalate to Secretary, DO-letter drafted
     │
     └── Day 21 (+7d): 🟣  "SYSTEMIC" — Tagged in repeat-delay registry
```

---

## 🔑 Demo Credentials

| Username | Password | Role | Unlocks |
|----------|----------|------|---------|
| `secy-mospi` | `setu123` | **Secretary** | Command dashboard, AI Card approval, Brief & DO-Letter |
| `ro-triage` | `setu123` | **Review Officer** | Triage queue, Verify, SLA & Escalation |
| `ee-sharma` | `setu123` | **Project Officer** | 5-min update, Photo proof, Blocker registration |
| `admin-demo` | `admin123` | **Admin** | Users management, Seed data, Export |

> All roles share access to: Projects, Dependencies, Tickets, Notifications, and Audit Trail.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+

### Run locally

```bash
# Clone the repository
git clone https://github.com/Aryan0047-ak/NEOHAILEX-PRAGATISETU.git
cd NEOHAILEX-PRAGATISETU

# Install dependencies
npm install

# Start development server
npm run dev
# → Opens at http://localhost:5173
```

### Other scripts

```bash
npm run build    # Production build → dist/
npm run preview  # Serve the production build locally
```

### Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Ctrl + K` / `Cmd + K` | Open Quick Actions palette |
| `Escape` | Close any modal or palette |

---

## 📁 Project Structure

```
NEOHAILEX-PRAGATISETU/
├── index.html                    # Vite entry point
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite config (React plugin)
│
├── src/
│   ├── main.jsx                  # React bootstrap
│   ├── App.jsx                   # Login ⇄ Shell router
│   ├── index.css                 # Design tokens & global styles
│   │
│   ├── data/
│   │   ├── seed.js               # 10 SYNTHETIC demo projects
│   │   └── users.js              # Demo RBAC users
│   │
│   ├── lib/
│   │   ├── engine.js             # ⚙️ Health / SLA / anomalies / hash-chain (pure JS)
│   │   ├── store.js              # 🗃️ Mock backend: state + actions + persistence
│   │   ├── useStore.js           # React hook binding to store
│   │   ├── i18n.js               # EN / हिं dictionary
│   │   ├── i18nToggle.js         # t() accessor
│   │   └── uiBus.js              # Modal open/close event bus
│   │
│   └── components/
│       ├── Login.jsx             # Password-based RBAC login screen
│       ├── Shell.jsx             # Sidebar, stepper, shared views
│       ├── Command.jsx           # 📊 Secretary — portfolio heat & triage
│       ├── Brief.jsx             # 📄 Flash note + DO-letter + print
│       ├── Triage.jsx            # 🚦 Review Officer — anomaly review desk
│       ├── Verify.jsx            # 🔍 Ground-truth claim verification
│       ├── Escalation.jsx        # ⏰ SLA clock & escalation view
│       ├── MyProjects.jsx        # 📋 Project Officer — 5-min field update
│       ├── PhotoBlocker.jsx      # 📷 Geo-tagged photo & blocker registration
│       ├── Projects.jsx          # 📁 Searchable portfolio: Gantt, EVM, docs
│       ├── AICardModal.jsx       # ⭐ Flagship — Evidence AI Card modal
│       ├── WhatIfModal.jsx       # 🔮 Delay-scenario "What If" slider
│       ├── ProjectDetailModal.jsx# Project deep-dive modal
│       ├── AdminUsers.jsx        # 👥 User management
│       ├── SeedData.jsx          # 🌱 Mock backend console
│       └── Palette.jsx           # 🔍 Quick actions command palette
│
├── docs/
│   ├── architecture.md           # Detailed architecture notes
│   └── demo-script.md            # Step-by-step hackathon demo guide
│
└── legacy/
    └── index.html                # Single-file MVP v5 (kept for reference)
```

---

## 🗂️ Synthetic Demo Dataset

10 interlinked synthetic projects covering real delay archetypes:

| Project ID | Name | Delay Driver | Status |
|------------|------|-------------|--------|
| **P-101** | Bareilly–Moradabad 4-Lane Highway | Forest clearance blocked by P-118 | 🔴 CRITICAL |
| **P-118** | Forest Clearance Stage-II (MoEF) | File pending — 45 days overdue | 🔴 CRITICAL |
| **P-203** | Lucknow Metro Extension 2B | On track — control case | 🟢 ON TRACK |
| **P-310** | Ganga STP Kanpur | Power link blocked by P-203 grid | 🟡 AT RISK |
| **P-415** | Rural Fiber Optic Gonda | Billing lag — 88% physical / 40% financial gap | 🔴 CRITICAL |
| **P-512** | Rail Doubling Sitapur–Burhwal | 4 ha land acquisition pending | 🟡 AT RISK |
| **P-623** | AIIMS Gorakhpur OPD Block | Monsoon delay — seasonal | 🟡 AT RISK |
| **P-704** | PMGSY Roads Bahraich | Contractor slow + repeat-text stall | 🔴 CRITICAL |
| **P-815** | Smart Metering Lucknow | Supply chain blocked by P-415 | 🟡 AT RISK |
| **P-920** | Amrit Sarovar Desilt | On track — control case | 🟢 ON TRACK |

The dataset demonstrates **3 cross-project blockage clusters**:
- `P-118 (Forest Clearance)` → blocks → `P-101 (Highway)`
- `P-203 (Metro grid)` → blocks → `P-310 (STP power link)`
- `P-415 (Fiber Optic)` → blocks → `P-815 (Smart Metering)`

---

## 🗺️ Roadmap (Post-Hackathon)

| Priority | Feature |
|----------|---------|
| 🔴 High | Real backend (Node/Express or Supabase) replacing localStorage mock |
| 🔴 High | SHA-256 audit chain + server-side JWT auth with hashed passwords |
| 🟡 Medium | Geo-tagged photo upload to object storage (AWS S3 / GCP GCS) |
| 🟡 Medium | Real Leaflet map with actual GIS coordinates from PAIMANA |
| 🟢 Nice | Repeat-delay registry — systemic blocker analytics across portfolios |
| 🟢 Nice | Email / SMS alerts for SLA breach via Twilio / AWS SNS |
| 🟢 Nice | Export to Excel / PDF for MoSPI reporting workflows |
| 🟢 Nice | ML-based anomaly detection using historical project data |

---

## 👨‍💻 Team

**Team Name:** NEOHAILEX

| Member | Role |
|--------|------|
| *(Team Leader)* | Full-Stack Development |
| *(Member 2)* | UI/UX & Frontend |
| *(Member 3)* | Domain Research & Documentation |
| *(Member 4)* | Testing & Deployment |

> **Institution:** *(Your College / University Name)*  
> **Hackathon:** Smart India Hackathon 2026

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**Built for Smart India Hackathon 2026**

`Problem Statement SIH26103` &nbsp;·&nbsp; `MOSPI` &nbsp;·&nbsp; `Smart Automation Theme` &nbsp;·&nbsp; `Software Category`

*PRAGATI SETU — turning late reports into owned, SLA-tracked, proof-closed interventions*

</div>
