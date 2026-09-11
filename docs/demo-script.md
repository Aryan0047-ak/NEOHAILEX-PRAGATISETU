# 3-minute demo script

**Setup before judges arrive:** `npm run dev` → open http://localhost:5173 → click **Reset demo** in the sidebar after logging in (or clear site data) so day = 0 and no tickets exist. Login screen showing.

## 0:00 – 0:20 · Hook (login screen)

> "Every year MoSPI's Flash Report arrives 30 days late, says 85% progress nobody can verify, and nothing has an owner. We built the closure layer on top: every anomaly becomes an owned intervention with proof."

Point at the login card: **password RBAC** — four accounts, four views. Show the credentials table.

## 0:20 – 1:00 · Secretary: detect → decide

1. Sign in `secy-mospi / setu123` → **Command**.
   - Say: "10 synthetic projects, sorted by **cost-of-delay** — P-101 ₹7 crore per week. Health 32, flagged: **62% physical vs 41% financial, no photo**."
2. Click **Open AI Card** on P-101.
   - Walk the flagship: **Claim → Evidence → Confidence 84% → Source → Time → Recommendation**.
3. Click **Approve + Assign** → lands on **Interventions**: ticket T-101, **14-day SLA** clock started.

## 1:00 – 1:45 · Review Officer + Project Officer: act

1. Logout → `ro-triage / setu123` → **Triage**: anomalies first. Open **SLA & Escalation** — click **Advance demo day** ×3 to show the clock moving.
2. Logout → `ee-sharma / setu123` → **Photo & Blocker**: pick P-101, type "girder casting done", **Submit + Photo** → proof attaches to the open ticket automatically.
3. Back to `ro-triage` → **Verify** → **Confirm** the claim.

## 1:45 – 2:20 · Close the loop

1. In **SLA & Escalation**: **Close with proof** on T-101 → overdue drops 29 → 19. Say: "No proof, no closure — and every step is in a **hash-chained audit**."
2. Open **Audit** — scroll: login, approval, proof, closure, each with actor + hash.

## 2:20 – 3:00 · Secretary: brief + differentiators

1. Login `secy-mospi` → **Brief + DO-Letter** → **Generate** → show the flash-note table → **Print / PDF**.
2. If time: **Dependencies** — P-118 blocks P-101; fix the source, unlock the corridor. **What-if** slider for scenario planning. **EN/हिं** toggle.
3. Close: "Rules-based AI, human decision, proof-or-no-closure, audit by default. React + Vite, runs offline, SYNTHETIC data."

## Fallbacks

- **Live demo breaks?** `legacy/index.html` — the single-file MVP opens straight in a browser, no server.
- **Judge asks about auth?** Mock for the demo; server-side hashing + JWT on the roadmap (docs/architecture.md).
- **"Where's the ML?"** There is none — rule-based detectors are explainable by design; each AI Card shows its evidence.
