// Domain engine — pure functions, no React. Health, status, cost-of-delay,
// anomaly detection, SLA/escalation ladder, hash-chained audit, forecasting.

const num = (v, fb = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
};

export function health(p = {}) {
  const over = num(p.over);
  const phys = num(p.phys);
  const fin = num(p.fin);
  let h = 100 - over * 1.2 - Math.abs(phys - fin) * 0.8 - (p.photo ? 0 : 9);
  if (typeof p.upd === 'string' && p.upd.trim().toLowerCase() === 'work in progress') h -= 7;
  if (p.flagged) h -= 10;
  return Math.max(4, Math.round(h));
}

// Itemized deductions behind health() — powers Evidence Card + tooltips.
export function healthBreakdown(p = {}) {
  const over = num(p.over);
  const gap = Math.abs(num(p.phys) - num(p.fin));
  const parts = [
    { key: 'overdue', pts: over * 1.2, detail: `${over}d overdue` },
    { key: 'gap', pts: gap * 0.8, detail: `phys-fin gap ${gap}%` },
    { key: 'photo', pts: p.photo ? 0 : 9, detail: p.photo ? 'photo present' : 'no photo' },
    {
      key: 'stall',
      pts: typeof p.upd === 'string' && p.upd.trim().toLowerCase() === 'work in progress' ? 7 : 0,
      detail: 'repeat-text stall',
    },
    { key: 'flag', pts: p.flagged ? 10 : 0, detail: 'RO flag' },
  ];
  return { score: health(p), parts };
}

export function status(h) {
  const n = num(h, 100);
  if (n < 45) return { label: 'CRITICAL', cls: 'p-red', color: '#dc2626' }
  if (n < 70) return { label: 'AT RISK', cls: 'p-yel', color: '#b45309' }
  return { label: 'ON TRACK', cls: 'p-grn', color: '#16a34a' }
}

export function costOfDelay(p = {}) {
  return Math.round(num(p.cost) * 0.002 * num(p.over) / 7 * 10) / 10
}

export function anomalies(p = {}, hist) {
  const a = []
  const phys = num(p.phys);
  const fin = num(p.fin);
  const over = num(p.over);
  const d = phys - fin
  let dup = 0
  const list = Array.isArray(hist) ? hist : []
  for (const h of list) if (h && h.txt === p.upd) dup++
  if (d > 15) a.push({ cls: 'p-pur', label: `phys-fin gap ${d}%` })
  if (!p.photo && phys >= 60) a.push({ cls: 'p-pur', label: 'no photo on claim' })
  if (dup >= 2) a.push({ cls: 'p-pur', label: `repeat text ×${dup}` })
  if (over > 30) a.push({ cls: 'p-red', label: `overdue ${over}d` })
  if (p.flagged) a.push({ cls: 'p-red', label: 'flagged false reporting' })
  return a
}

// Composite risk score 0-100 (higher = worse) — blends health, cost, blockers.
export function riskScore(p = {}, db = {}) {
  const h = health(p)
  const cost = Math.min(30, costOfDelay(p) * 1.5)
  const deps = Array.isArray(p.dep) ? p.dep : []
  const upd = (db && db.upd) || {}
  const depRisk = deps.filter((d) => upd[d] && health(upd[d]) < 45).length * 12
  const blockerRisk = p.blocker && p.blocker !== 'None' ? 10 : 0
  return Math.min(100, Math.round((100 - h) * 0.6 + cost + depRisk + blockerRisk))
}

// Portfolio aggregates for Command dashboard — counts, avg health, total burn.
export function portfolioStats(projects = []) {
  const list = Array.isArray(projects) ? projects : [];
  let critical = 0, atRisk = 0, onTrack = 0, totalDelay = 0;
  for (const p of list) {
    const h = health(p || {});
    if (h < 45) critical++;
    else if (h < 70) atRisk++;
    else onTrack++;
    totalDelay += costOfDelay(p || {});
  }
  const avgHealth = list.length
    ? Math.round(list.reduce((a, p) => a + health(p || {}), 0) / list.length)
    : 0;
  return {
    total: list.length, critical, atRisk, onTrack, avgHealth,
    totalDelay: Math.round(totalDelay * 10) / 10,
  };
}

// Forecast: burn actual vs planned → projected delay days at completion.
export function forecast(p = {}) {
  const raw = Array.isArray(p.burn) ? p.burn : [];
  const burn = raw.map((v) => num(v)).filter((v) => v > 0);
  const phys = num(p.phys);
  const over = num(p.over);
  const actual = burn.reduce((a, b) => a + b, 0)
  const planned = burn.reduce((a, b) => a + b * 1.35, 0) || 1
  const pace = actual > 0 ? actual / planned : 1 // <1 = slower than plan
  const lastV = burn.length ? burn[burn.length - 1] : 5;
  const monthsLeft = Math.max(1, Math.round((100 - phys) / Math.max(4, lastV)))
  const projected = Number.isFinite(pace) && pace > 0
    ? Math.round(monthsLeft * (1 / pace - 1) * 2) + over
    : over;
  const pts = burn.map((v, i) => ({ x: i, v }))
  const plannedPts = burn.map((v, i) => ({ x: i, v: v * 1.35 }))
  // linear trend extension for the "projected" dashed line
  const last = burn.length - 1
  const slope = last > 0 ? (burn[last] - burn[0]) / last : 0
  const base = burn.length ? burn[last] : 5;
  const trend = [0, 1].map((k) => ({ x: last + 1 + k, v: Math.max(0.5, base + slope * (k + 1)) }))
  return { pace, monthsLeft, projectedDelay: Math.max(over, projected), pts, plannedPts, trend }
}

// Escalation ladder: T-2d reminder → T-0 red alert → +3d Secretary → +7d systemic
export function slaState(t = {}, day = 0) {
  const sla = num(t.sla);
  const d = num(day);
  const left = sla - d
  if (t.st === 'Closed') return { cls: 'p-grn', label: 'Closed', pct: 100, bg: '#16a34a' }
  if (left > 2) return { cls: 'p-yel', label: `SLA ${left}d left`, pct: 35, bg: '#b45309' }
  if (left >= 0) return { cls: 'p-red', label: 'DUE — red alert', pct: 60, bg: '#dc2626' }
  if (left >= -3) return { cls: 'p-red', label: `OVERDUE ${-left}d → escalate to Secretary`, pct: 70, bg: '#dc2626' }
  if (left >= -7) return { cls: 'p-pur', label: `SYSTEMIC ${-left}d — repeat-delay registry`, pct: 85, bg: '#7c3aed' }
  return { cls: 'p-pur', label: `SYSTEMIC +${-left}d`, pct: 90, bg: '#7c3aed' }
}

export function isDue(t = {}, day = 0) {
  const s = slaState(t, day)
  return t.st !== 'Closed' && (s.label.startsWith('DUE') || s.label.startsWith('OVERDUE'))
}

// Deterministic djb2-style hash chain — demo-grade, replace with SHA-256 server-side.
export function chainHash(prevHash, action, salt) {
  const s = String(prevHash ?? '') + String(action ?? '') + String(salt ?? '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h.toString(16)
}

export function verifyChain(audit) {
  if (!Array.isArray(audit)) return false;
  let prev = '0'
  for (const a of audit) {
    if (!a || a.prev !== prev || typeof a.hash !== 'string') return false
    prev = a.hash
  }
  return true
}
