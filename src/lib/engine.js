// Domain engine — pure functions, no React. Health, status, cost-of-delay,
// anomaly detection, SLA/escalation ladder, hash-chained audit, forecasting.

export function health(p) {
  let h = 100 - p.over * 1.2 - Math.abs(p.phys - p.fin) * 0.8 - (p.photo ? 0 : 9)
  if (p.upd === 'work in progress') h -= 7
  if (p.flagged) h -= 10
  return Math.max(4, Math.round(h))
}

export function status(h) {
  if (h < 45) return { label: 'CRITICAL', cls: 'p-red', color: '#dc2626' }
  if (h < 70) return { label: 'AT RISK', cls: 'p-yel', color: '#b45309' }
  return { label: 'ON TRACK', cls: 'p-grn', color: '#16a34a' }
}

export function costOfDelay(p) {
  return Math.round(p.cost * 0.002 * p.over / 7 * 10) / 10
}

export function anomalies(p, hist) {
  const a = []
  const d = p.phys - p.fin
  let dup = 0
  for (const h of hist || []) if (h.txt === p.upd) dup++
  if (d > 15) a.push({ cls: 'p-pur', label: `phys-fin gap ${d}%` })
  if (!p.photo && p.phys >= 60) a.push({ cls: 'p-pur', label: 'no photo on claim' })
  if (dup >= 2) a.push({ cls: 'p-pur', label: `repeat text ×${dup}` })
  if (p.over > 30) a.push({ cls: 'p-red', label: `overdue ${p.over}d` })
  if (p.flagged) a.push({ cls: 'p-red', label: 'flagged false reporting' })
  return a
}

// Composite risk score 0-100 (higher = worse) — blends health, cost, blockers.
export function riskScore(p, db) {
  const h = health(p)
  const cost = Math.min(30, costOfDelay(p) * 1.5)
  const depRisk = (p.dep || []).filter((d) => db.upd[d] && health(db.upd[d]) < 45).length * 12
  const blockerRisk = p.blocker && p.blocker !== 'None' ? 10 : 0
  return Math.min(100, Math.round((100 - h) * 0.6 + cost + depRisk + blockerRisk))
}

// Forecast: burn actual vs planned → projected delay days at completion.
export function forecast(p) {
  const burn = p.burn || []
  const actual = burn.reduce((a, b) => a + b, 0)
  const planned = burn.reduce((a, b) => a + b * 1.35, 0) || 1
  const pace = actual / planned // <1 = slower than plan
  const monthsLeft = Math.max(1, Math.round((100 - p.phys) / Math.max(4, burn[burn.length - 1] || 5)))
  const projected = Math.round(monthsLeft * (1 / pace - 1) * 2) + p.over
  const pts = burn.map((v, i) => ({ x: i, v }))
  const plannedPts = burn.map((v, i) => ({ x: i, v: v * 1.35 }))
  // linear trend extension for the "projected" dashed line
  const last = burn.length - 1
  const slope = last > 0 ? (burn[last] - burn[0]) / last : 0
  const trend = [0, 1].map((k) => ({ x: last + 1 + k, v: Math.max(0.5, burn[last] + slope * (k + 1)) }))
  return { pace, monthsLeft, projectedDelay: Math.max(p.over, projected), pts, plannedPts, trend }
}

// Escalation ladder: T-2d reminder → T-0 red alert → +3d Secretary → +7d systemic
export function slaState(t, day) {
  const left = t.sla - day
  if (t.st === 'Closed') return { cls: 'p-grn', label: 'Closed', pct: 100, bg: '#16a34a' }
  if (left > 2) return { cls: 'p-yel', label: `SLA ${left}d left`, pct: 35, bg: '#b45309' }
  if (left >= 0) return { cls: 'p-red', label: 'DUE — red alert', pct: 60, bg: '#dc2626' }
  if (left >= -3) return { cls: 'p-red', label: `OVERDUE ${-left}d → escalate to Secretary`, pct: 70, bg: '#dc2626' }
  if (left >= -7) return { cls: 'p-pur', label: `SYSTEMIC ${-left}d — repeat-delay registry`, pct: 85, bg: '#7c3aed' }
  return { cls: 'p-pur', label: `SYSTEMIC +${-left}d`, pct: 90, bg: '#7c3aed' }
}

export function isDue(t, day) {
  const s = slaState(t, day)
  return t.st !== 'Closed' && (s.label.startsWith('DUE') || s.label.startsWith('OVERDUE'))
}

// Deterministic djb2-style hash chain — demo-grade, replace with SHA-256 server-side.
export function chainHash(prevHash, action, salt) {
  const s = prevHash + action + salt
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h.toString(16)
}

export function verifyChain(audit) {
  let prev = '0'
  for (const a of audit) {
    if (a.prev !== prev) return false
    prev = a.hash
  }
  return true
}
