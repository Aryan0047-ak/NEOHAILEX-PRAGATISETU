import { USERS } from '../data/users.js'
import { SEED } from '../data/seed.js'
import { chainHash } from './engine.js'

// Mock backend: the entire app state in one plain object, persisted to
// localStorage (key "setu"). Swap persist()+load() for fetch() calls to
// attach a real server later — components only talk to these actions.

const KEY = 'setu'
let uid = Date.now() % 100000
const fresh = () => {
  const upd = {}, hist = {}
  for (const p of SEED) { upd[p.id] = structuredClone(p); hist[p.id] = [] }
  return {
    v: 1, session: null, lang: 'en', day: 0,
    tickets: [], audit: [], notifs: [], hist, upd,
    users: structuredClone(USERS), fails: {},
  }
}

const load = () => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) { const db = JSON.parse(raw); if (db && db.v === 1) return db }
  } catch { /* corrupted store — reseed */ }
  return fresh()
}

let db = load()
const subs = new Set()
const emit = () => subs.forEach((fn) => fn(db))
export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn) }
export const getState = () => db

// Clone-on-write: every save produces a NEW top-level object so React state
// updates always see a changed reference (mutation alone would bail out).
const save = () => { db = { ...db }; localStorage.setItem(KEY, JSON.stringify(db)); emit() }

const actor = () => (db.session ? `${db.session.n} (${db.session.r})` : 'System')

export function log(act) {
  const prev = db.audit.length ? db.audit[db.audit.length - 1].hash : '0'
  db.audit.push({
    t: new Date().toLocaleTimeString(), d: db.day, by: actor(),
    act, hash: chainHash(prev, act, (uid++) + ''), prev,
  })
  save()
}
export function notify(txt, who = 'all', kind = 'info') {
  db.notifs.unshift({ id: ++uid, txt, who, t: new Date().toLocaleTimeString(), d: db.day, unread: true, kind })
  save()
}

export function toast(msg, kind = 'info') {
  window.dispatchEvent(new CustomEvent('setu-toast', { detail: { msg, kind, id: ++uid } }))
}

/* ---------------- auth ---------------- */
export function login(u, pw) {
  const m = db.users.find((x) => x.u === u && x.pw === pw)
  if (!m) {
    db.fails[u] = (db.fails[u] || 0) + 1
    if (db.fails[u] >= 3) log(`⚠ ${db.fails[u]} failed logins for ${u}`)
    save()
    return { ok: false, reason: 'bad' }
  }
  if (!m.ok) { log(`Login blocked — disabled account ${u}`); save(); return { ok: false, reason: 'disabled' } }
  db.fails[u] = 0
  db.session = { u: m.u, n: m.n, r: m.r }
  log(`Login ${m.u} as ${m.r}`)
  return { ok: true }
}
export function logout() { log(`Logout ${db.session ? db.session.u : ''}`); db.session = null; save() }

/* ---------------- prefs ---------------- */
export function toggleLang() { db.lang = db.lang === 'en' ? 'hi' : 'en'; save() }
export function advanceDay() {
  db.day++
  const overdue = db.tickets.filter((t) => t.st !== 'Closed' && t.sla - db.day < 0)
  save()
  return overdue
}
export function resetDemo() { const s = db.session; localStorage.removeItem(KEY); db = load(); db.session = s; log('Demo reloaded — 10-case seed'); toast('10 cases reloaded — still logged in', 'ok') }
export function purge() { localStorage.removeItem(KEY); db = fresh(); save() }
export function exportJSON() {
  const blob = new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'pragati-setu-demo.json'
  a.click()
  log('Exported JSON')
  toast('JSON exported', 'ok')
}

/* ---------------- admin ---------------- */
export function toggleUser(uid2) {
  const u = db.users.find((x) => x.u === uid2)
  if (u) { u.ok = u.ok ? 0 : 1; log(`User toggled ${uid2}`); save() }
}

/* ---------------- projects ---------------- */
export const getProject = (id) => db.upd[id]
export const allProjects = () => Object.values(db.upd)

export function submitUpdate(id, { phys, fin, upd, photo, photoData }) {
  const p = db.upd[id]
  p.phys = Math.max(0, Math.min(100, phys)); p.fin = Math.max(0, Math.min(100, fin))
  p.upd = upd; p.photo = photo ? 1 : 0
  if (photoData) p.photoData = photoData
  if (photo && p.phys > 60) p.over = Math.max(0, p.over - 7)
  db.hist[id].unshift({ d: new Date().toLocaleDateString(), txt: `${p.phys}% / ${p.fin}% — ${upd}`, photo: photo ? 1 : 0, img: photoData || null })
  log(`Update ${id} ${p.phys}/${p.fin} ph=${photo ? 1 : 0}`)
  notify(`Update ${id} submitted${photo ? ' with photo' : ' (no photo)'}`, 'Review Officer', photo ? 'ok' : 'warn')
  toast(`Update saved for ${id}${photo ? ' with photo ✓' : ''}`, photo ? 'ok' : 'warn')
}
export function raiseBlocker(id, blocker) {
  const p = db.upd[id]
  p.blocker = blocker || p.blocker
  log(`Blocker raised ${id}: ${p.blocker}`)
  notify(`⚠ ${id} blocker: ${p.blocker}`, 'Secretary', 'warn')
  toast(`Blocker raised on ${id}`, 'warn')
}
export function verifyClaim(id, ok) {
  const p = db.upd[id]
  if (ok) { p.flagged = false; log(`Verified ${id} — claim matches evidence`); notify(`Verified ${id} by ${actor()}`, 'all', 'ok'); toast(`${id} verified ✓`, 'ok') }
  else { p.flagged = true; log(`FLAG ${id} — false reporting suspected`); notify(`⚠ ${id} flagged for false reporting → Secretary`, 'Secretary', 'err'); toast(`${id} flagged — false reporting`, 'err') }
}

/* ---------------- tickets ---------------- */
export function nextTid() { return 'T-' + (101 + db.tickets.length) }
export function approveCard(id, owner) {
  const t = {
    id: nextTid(), proj: id, owner,
    act: 'Intervene: ' + db.upd[id].blocker, sla: db.day + 14, opened: db.day,
    st: 'Open', proof: '', esc: 0, t: new Date().toLocaleString(),
  }
  db.tickets.push(t)
  log(`Approved ${id} → ${owner} (14d SLA)`)
  notify(`Ticket ${t.id} assigned to ${owner}`, 'all', 'ok')
  toast(`${t.id} created — 14d SLA running`, 'ok')
  return t
}
export function rejectCard(id) { log(`Rejected AI ${id} — human review`); save(); toast(`AI Card for ${id} rejected`, 'warn') }
export function submitProof(tid) {
  const t = db.tickets.find((x) => x.id === tid)
  if (t) { t.st = 'Proof submitted'; t.proof = `geo-photo + NOC draft @ day ${db.day}` }
  log(`Proof submitted ${tid}`)
  notify(`Proof submitted on ${tid} → Secretary`, 'Secretary', 'info')
  toast(`Proof submitted on ${tid}`, 'ok')
}
export function closeTicket(tid) {
  const t = db.tickets.find((x) => x.id === tid)
  if (!t) return
  if (t.st !== 'Proof submitted' && !t.proof) { toast('Proof required before closure — proof-or-no-closure', 'err'); return }
  t.st = 'Closed'
  const p = db.upd[t.proj]
  if (p) p.over = Math.max(0, p.over - 10)
  log(`Closed ${tid} with NOC/photo`)
  notify(`✅ ${tid} closed with proof`, 'all', 'ok')
  toast(`${tid} closed — overdue reduced`, 'ok')
}
export function escalate(tid) {
  const t = db.tickets.find((x) => x.id === tid)
  if (t) t.esc = (t.esc || 0) + 1
  log(`Escalated ${tid} to Secretary`)
  notify(`⚠ ${tid} escalated to Secretary — DO-letter ready`, 'Secretary', 'warn')
  toast(`${tid} escalated to Secretary`, 'warn')
}
export function markAllRead() { db.notifs.forEach((n) => { n.unread = false }); save() }
export function submitWhatIf(id, extra) {
  const p = db.upd[id]
  p.over += extra
  log(`What-if accepted ${id} +${extra}d`)
  save()
  toast(`Scenario applied: ${id} +${extra}d overdue`, 'warn')
}
export function issueDOLetter() { log('DO-letter issued (demo)'); notify('DO-letter logged to audit', 'all', 'info'); toast('DO-letter issued + logged to audit', 'ok') }
