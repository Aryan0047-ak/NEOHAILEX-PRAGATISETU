# Architecture

## Layers

```
┌────────────────────────────────────────────────┐
│ components/   React views (role-gated)         │
├────────────────────────────────────────────────┤
│ lib/uiBus.js  modal events  lib/useStore.js    │
├────────────────────────────────────────────────┤
│ lib/store.js  state + actions + persistence    │  ← swap this for a real API
├────────────────────────────────────────────────┤
│ lib/engine.js pure domain logic (no React)     │
├────────────────────────────────────────────────┤
│ data/         seed projects + demo users       │
└────────────────────────────────────────────────┘
```

**Design rule:** components never touch `localStorage` and never compute health/SLA themselves — they call *actions* (`approveCard`, `submitProof`, …) and read *derived values* from `lib/engine.js`. That makes the domain logic portable to a server and unit-testable without a DOM.

## Data flow

1. `store.js` loads state from `localStorage` (key `setu`) or seeds 10 synthetic projects.
2. User action → store action → mutates the draft state → appends to the hash-chained audit → `save()` persists and **clones the top-level object** → subscribers get a new reference → React re-renders.
3. The demo clock (`advanceDay`) drives SLA states without touching wall-clock time, so judges can watch the escalation ladder fire on demand.

## RBAC matrix

| Capability | Secretary | Review Officer | Project Officer | Admin |
|---|---|---|---|---|
| Command heat / triage | ✅ | — | — | — |
| Approve AI Card → ticket | ✅ | — | — | — |
| Brief + DO-letter | ✅ | — | — | — |
| Triage queue / flag false reporting | — | ✅ | — | — |
| Verify claims | — | ✅ | — | — |
| SLA & escalation view | — | ✅ | — | — |
| 5-min update + photo proof | — | — | ✅ | — |
| Raise blocker | — | — | ✅ | — |
| Users / seed / purge / export | — | — | — | ✅ |
| Projects / Dependencies / Tickets / Notifications / Audit | ✅ | ✅ | ✅ | ✅ |

Auth is mock (plaintext demo passwords in `src/data/users.js`, session in localStorage). For production: hash passwords server-side, issue JWT sessions, move the audit chain to SHA-256 with server timestamps.

## Swapping in a real backend

`lib/store.js` is the only file that knows about persistence. Replace its internals with `fetch()` calls to e.g. `GET /projects`, `POST /tickets`, `POST /tickets/:id/proof` — the exported action signatures (`approveCard(id, owner)`, `submitProof(tid)`, `closeTicket(tid)`, `escalate(tid)`, `submitUpdate(...)`, `login(u, pw)`, …) are the API contract. Components keep working unchanged.

## Escalation ladder (business rule)

| Offset | State | UI |
|---|---|---|
| T-2d | Reminder | amber "SLA 2d left" |
| T-0 | Red alert to owner + Review Officer | red "DUE" |
| +3d | Escalate to Secretary, DO-letter auto-drafted | red "OVERDUE n d" |
| +7d | Systemic tag → repeat-delay registry | violet "SYSTEMIC" |

## Anomaly detectors (rule-based, no ML)

1. **Phys-fin gap** — physical % minus financial % > 15 → over-claiming signal
2. **No-photo claim** — ≥60% progress reported with no geo-tagged photo
3. **Repeat-text stall** — identical update text submitted ≥2 times before
4. **Chronic overdue** — >30 days past deadline
5. **RO flag** — human-verified false report (reduces health by 10)

Health score = `100 − overdue×1.2 − |phys−fin|×0.8 − (photo?0:9) − (stall?7) − (flagged?10)`, floored at 4.
