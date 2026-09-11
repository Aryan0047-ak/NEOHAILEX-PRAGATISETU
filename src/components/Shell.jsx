import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore, } from '../lib/useStore.js'
import { getState, toggleLang, logout, resetDemo, advanceDay, markAllRead, escalate, toast, submitProof, closeTicket } from '../lib/store.js'
import { t } from '../lib/i18nToggle.js'
import { health, status, slaState, costOfDelay, verifyChain } from '../lib/engine.js'
import Command from './Command.jsx'
import Brief from './Brief.jsx'
import Triage from './Triage.jsx'
import Verify from './Verify.jsx'
import Escalation from './Escalation.jsx'
import MyProjects from './MyProjects.jsx'
import PhotoBlocker from './PhotoBlocker.jsx'
import AdminUsers from './AdminUsers.jsx'
import SeedData from './SeedData.jsx'
import Projects from './Projects.jsx'
import AICardModal from './AICardModal.jsx'
import WhatIfModal from './WhatIfModal.jsx'
import ProjectDetailModal from './ProjectDetailModal.jsx'
import Palette from './Palette.jsx'
import { openAI, openWhatIf, openProj, onPalette } from '../lib/uiBus.js'

const NAV = {
  Secretary: { label: 'nav_sec_desk', items: [['cmd', '📊', 'nav_cmd'], ['map', '🗺', 'nav_map'], ['brief', '📄', 'nav_brief']] },
  'Review Officer': { label: 'nav_ro_desk', items: [['tri', '🚦', 'nav_tri'], ['ver', '🔍', 'nav_ver'], ['esc', '⏰', 'nav_esc']] },
  'Project Officer': { label: 'nav_po_desk', items: [['upd', '📋', 'nav_upd'], ['ph', '📷', 'nav_ph']] },
  Admin: { label: 'nav_ad_desk', items: [['users', '👥', 'nav_users'], ['seed', '🌱', 'nav_seed']] },
}
const SHARED = [
  { label: 'nav_portfolio', items: [['proj', '📁', 'nav_proj'], ['dep', '🕸', 'nav_dep'], ['tick', '🎫', 'nav_tick']] },
  { label: 'nav_system', items: [['notif', '🔔', 'nav_notif'], ['audit', '🧾', 'nav_audit']] },
]
const TITLES = {
  cmd: ['Command', 'Portfolio heat, triage by cost-of-delay, one-click Evidence AI Cards'],
  map: ['Portfolio Map', 'Synthetic pin map — size = ₹cr, colour = health, click a pin for detail'],
  brief: ['Brief + DO-Letter', 'One-click executive brief, editable DO-letter, print-ready PDF'],
  tri: ['Triage Queue', 'Anomaly-first review desk — flag false reporting, route to AI Card'],
  ver: ['Verify', 'Ground-truth check — confirm claims or flag mismatches'],
  esc: ['SLA & Escalation', '14-day SLA clock with the T-2d → T-0 → +3d → +7d ladder'],
  upd: ['My Projects', '5-minute field update — progress, finance, notes'],
  ph: ['Photo & Blocker', 'Geo-tagged photo proof and blocker registration'],
  users: ['Users & Access', 'Role-based accounts, disable/enable, failed-login counters'],
  seed: ['Seed & Data', 'Mock backend console — reload, purge, export, storage stats'],
  proj: ['Projects', 'Searchable portfolio with milestone gantt, EVM burn and doc gallery'],
  dep: ['Dependencies', 'Cross-project blockage graph — fix the source to unlock downstream'],
  tick: ['Interventions', 'Ticket queue with live SLA timers and proof-or-no-closure'],
  notif: ['Notifications', 'Role-routed alerts from every action in the loop'],
  audit: ['Audit Trail', 'Hash-chained, tamper-evident log of every decision'],
}
const STEP_MAP = { cmd: 1, proj: 0, map: 0, dep: 2, tri: 2, ver: 6, esc: 5, tick: 5, upd: 6, ph: 6, brief: 4, audit: 6, users: 0, seed: 0, notif: 5 }
const STEP_NAMES = ['1 DATA', '2 DETECTION', '3 DIAGNOSIS', '4 RECOMMEND.', '5 DECISION', '6 ACTION', '7 VERIFY']
// Clicking a step jumps to the view that owns that stage — one continuous story.
const STEP_VIEW = ['proj', 'tri', 'dep', 'brief', 'tick', 'esc', 'ver']
const ROLE_HOME = { Secretary: 'cmd', 'Review Officer': 'tri', 'Project Officer': 'upd', Admin: 'users' }

const POS = { 'P-101': [62, 30], 'P-118': [40, 20], 'P-203': [58, 55], 'P-310': [46, 63], 'P-415': [28, 42], 'P-512': [56, 41], 'P-623': [70, 45], 'P-704': [34, 28], 'P-815': [52, 60], 'P-920': [38, 70] }

export default function Shell() {
  const db = useStore()
  const [view, setView] = useState({ Secretary: 'cmd', 'Review Officer': 'tri', 'Project Officer': 'upd', Admin: 'users' }[db.session.r])
  const [q2, setQ2] = useState('')
  const [filter, setFilter] = useState('')
  const [live, setLive] = useState(false)
  const [pal, setPal] = useState(false)

  // Palette hotkey: Cmd/Ctrl+K, plus '/' when not typing in a field
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPal((v) => !v) }
      if (e.key === 'Escape') setPal(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])
  useEffect(() => { onPalette(() => setPal(true)) }, [])

  // Live ops simulation: auto-advance the demo clock, auto-escalate overdue
  useEffect(() => {
    if (!live) return
    const tick = () => {
      const dueNow = getState().tickets.filter((x) => x.st !== 'Closed' && x.sla - getState().day === 1)
      advanceDay()
      dueNow.forEach((tk) => toast(`SLA due tomorrow: ${tk.id} (${tk.owner})`, 'warn'))
      getState().tickets.forEach((tk) => {
        if (tk.st !== 'Closed' && tk.sla - getState().day < 0 && !tk.autoEsc) {
          tk.autoEsc = 1
          escalate(tk.id)
        }
      })
    }
    const iv = setInterval(tick, 8000)
    return () => clearInterval(iv)
  }, [live])

  const openTickets = db.tickets.filter((x) => x.st !== 'Closed').length
  const unread = db.notifs.filter((n) => n.unread).length
  const roleNav = NAV[db.session.r]
  const info = TITLES[view] || TITLES.cmd

  const badge = (id) =>
    id === 'tick' && openTickets ? <span className={`nbadge nb-red`}>{openTickets}</span>
    : id === 'notif' && unread ? <span className="nbadge nb-blue">{unread}</span> : null

  const NavBtn = ([id, ic, key]) => (
    <button key={id} className={`navbtn${view === id ? ' on' : ''}`} onClick={() => setView(id)}>
      <span className="ic">{ic}</span> {t(key)} {badge(id)}
    </button>
  )

  const render = () => {
    switch (view) {
      case 'cmd': return <Command />
      case 'map': return <Map />
      case 'brief': return <Brief />
      case 'audit': return <Audit />
      case 'tri': return <Triage />
      case 'ver': return <Verify />
      case 'esc': return <Escalation />
      case 'upd': return <MyProjects />
      case 'ph': return <PhotoBlocker />
      case 'users': return <AdminUsers />
      case 'seed': return <SeedData />
      case 'proj': return <Projects q={q2} setQ={setQ2} filter={filter} setFilter={setFilter} />
      case 'dep': return <Dependencies />
      case 'tick': return <Tickets />
      case 'notif': return <Notifs />
      default: return null
    }
  }

  return (
    <div className="app">
      <aside className="side">
        <div className="brandbar">
          <div className="brandglyph">प</div>
          <div className="brandname">PRAGATI SETU<small>SYNTHETIC DEMO • MoSPI</small></div>
        </div>
        <button className="quickactions" onClick={() => setPal(true)}>
          🔍 Quick actions <kbd>⌘K</kbd>
        </button>

        <div className="seclabel">{t(roleNav.label)}</div>
        {roleNav.items.map(NavBtn)}
        {SHARED.map((sec) => (
          <div key={sec.label}>
            <div className="seclabel">{t(sec.label)}</div>
            {sec.items.map(NavBtn)}
          </div>
        ))}

        <div className="sidefoot">
          <div className="usercard">
            <div className="avatar">{db.session.n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}</div>
            <div>
              <div className="un">{db.session.n}</div>
              <div className="ur">{db.session.r}</div>
            </div>
            <div className="spacer" />
            <button className="iconbtn" title="EN / हिं toggle" onClick={toggleLang}>🌐</button>
            <button className="iconbtn" title="Reset demo data" onClick={() => { resetDemo(); setView('cmd') }}>↺</button>
            <button className="iconbtn" title="Logout" onClick={logout}>⎋</button>
          </div>
          <div className="demoday">{db.session.u} • demo day {db.day} • all data synthetic</div>
        </div>
      </aside>

      <div className="mainwrap">
        <div className="topbar">
          <div>
            <div className="crumbs"><button onClick={() => setView('cmd')}>Setu</button> ▸ <button onClick={() => setView(ROLE_HOME[db.session.r] || 'cmd')}>{db.session.r}</button> ▸ <b>{info[0]}</b></div>
            <div className="pagetitle">{info[0]}</div>
            <div className="pagesub">{info[1]}</div>
          </div>
          <div className="grow" />
          <div className="topactions">
            <button className={`livebtn${live ? ' on' : ''}`} onClick={() => { setLive(!live); toast(live ? 'Live ops paused' : 'Live ops ON — clock auto-advances every 8s', live ? 'info' : 'ok') }}>
              <span className="livedot" /> Live ops
            </button>
            <button className="daypill" onClick={() => { const od = advanceDay(); toast(`Day ${db.day + 1} — ${od.length ? od.length + ' ticket(s) past SLA' : 'all SLAs healthy'}`, od.length ? 'warn' : 'ok') }}>
              ⏩ Day {db.day}
            </button>
          </div>
        </div>

        <div className="content">
          <div className="steps noprint">
            {STEP_NAMES.map((s, i) => (
              <button key={s} title={`Go to ${s}`} onClick={() => setView(STEP_VIEW[i])} className={`step${i === (STEP_MAP[view] || 0) ? ' on' : i < (STEP_MAP[view] || 0) ? ' done' : ''}`}>{s}</button>
            ))}
          </div>
          {render()}
        </div>
      </div>

      <AICardModal />
      <WhatIfModal />
      <ProjectDetailModal />
      {pal && <Palette close={() => setPal(false)} setView={setView} />}
      <Toasts />
    </div>
  )
}

/* ---------- Toasts ---------- */
function Toasts() {
  const [items, setItems] = useState([])
  useEffect(() => {
    const h = (e) => {
      const t = e.detail
      setItems((cur) => [...cur, t])
      setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== t.id)), 3800)
    }
    window.addEventListener('setu-toast', h)
    return () => window.removeEventListener('setu-toast', h)
  }, [])
  return <div className="toasts">{items.map((x) => <div key={x.id} className={`toast ${x.kind || ''}`}>{x.msg}</div>)}</div>
}

/* ---------- Portfolio map (mock UP SVG) ---------- */
function Map() {
  const db = useStore()
  const all = Object.values(db.upd)
  return (
    <div className="panel card">
      <div className="phead"><div><div className="pt">{t('h_map')}</div><div className="ps">Mock map — click a pin to open project detail</div></div><div className="grow" />
        <span className="legend"><span><span className="sw" style={{ background: '#dc2626' }} />Critical</span><span><span className="sw" style={{ background: '#b45309' }} />At risk</span><span><span className="sw" style={{ background: '#16a34a' }} />On track</span></span></div>
      <div className="pbody">
        <svg viewBox="0 0 100 84" width="100%" style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, maxHeight: 430 }}>
          <path d="M18,10 L58,6 L80,14 L88,34 L78,58 L62,76 L38,80 L22,66 L12,40 Z" fill="#eef1ea" stroke="#c9cec0" strokeWidth=".4" />
          {all.map((p) => {
            const h = health(p), st = status(h), [x, y] = POS[p.id] || [50, 50]
            const r = 2.4 + p.cost / 260
            return (
              <g key={p.id} onClick={() => openProj(p.id)} style={{ cursor: 'pointer' }}>
                <circle cx={x} cy={y} r={r} fill={st.color} opacity=".82" stroke="#fff" strokeWidth=".4" />
                <text x={x + r + 1.4} y={y + 1.1} fontSize="2.7" fill="var(--ink)" fontWeight="700">{p.id}</text>
                <text x={x + r + 1.4} y={y + 4.4} fontSize="2.1" fill="var(--mut)">₹{p.cost}cr H{h}</text>
              </g>
            )
          })}
        </svg>
        <div className="legend" style={{ marginTop: 8 }}>
          <span>Clusters: Bareilly–Moradabad road (P-101 ← P-118 FC)</span>
          <span>Kanpur STP + Metro grid (P-310 ← P-203)</span>
          <span>Lucknow fiber → metering (P-815 ← P-415)</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- Dependency graph (tiered SVG) ---------- */
function Dependencies() {
  const db = useStore()
  const all = Object.values(db.upd)
  const roots = all.filter((p) => !p.dep.length)
  const children = all.filter((p) => p.dep.length)
  const byId = {}
  let y = 30
  roots.forEach((p) => { byId[p.id] = { p, x: 60, y }; y += 74 })
  children.forEach((p, ci) => { byId[p.id] = { p, x: 400, y: 30 + ci * 96 } })
  const H = Math.max(y + 20, 30 + children.length * 96 + 60, 340), W = 720
  return (
    <div className="panel card">
      <div className="phead"><div><div className="pt">{t('h_dep')}</div><div className="ps">{t('dep_hint')}</div></div></div>
      <div className="pbody">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12, maxHeight: 460 }}>
          <defs>
            <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" /></marker>
          </defs>
          {all.flatMap((a) => a.dep.map((d) => {
            const f = byId[d], to = byId[a.id]
            if (!f || !to) return null
            const x1 = f.x + 230, y1 = f.y + 26, x2 = to.x, y2 = to.y + 26
            const blocked = health(f.p) < 45
            return <path key={d + a.id} d={`M ${x1} ${y1} C ${x1 + 80} ${y1}, ${x2 - 80} ${y2}, ${x2 - 4} ${y2}`} stroke={blocked ? '#dc2626' : '#94a3b8'} strokeWidth={blocked ? 2 : 1.4} fill="none" strokeDasharray="6,4" markerEnd="url(#arr)" />
          }))}
          {Object.values(byId).map(({ p, x, y: ny }) => {
            const h = health(p), st = status(h)
            return (
              <g key={p.id} onClick={() => openAI(p.id)} style={{ cursor: 'pointer' }}>
                <rect x={x} y={ny} width="230" height="52" rx="11" fill="#fff" stroke={st.color} strokeWidth={h < 45 ? 2.6 : 1.4} />
                <text x={x + 12} y={ny + 21} fill="var(--ink)" fontSize="12" fontWeight="700">{p.id} · H{h} · {st.label}</text>
                <text x={x + 12} y={ny + 38} fill="var(--mut)" fontSize="10">{p.name.substring(0, 34)}</text>
              </g>
            )
          })}
        </svg>
        <div className="legend"><span>Dashed red = blocked edge (source project critical) · click any node → Evidence AI Card</span></div>
      </div>
    </div>
  )
}

/* ---------- Tickets ---------- */
function Tickets() {
  const db = useStore()
  const canProof = true // demo: any role can attach proof so the loop never dead-ends
  return (
    <div className="panel card">
      <div className="phead"><div><div className="pt">{t('h_tick')}</div><div className="ps">Proof-or-no-closure enforced · escalate past +3d overdue</div></div></div>
      <div className="pbody">
        {db.tickets.length === 0 && <div className="nores">No tickets yet — open an Evidence AI Card from Command and approve it.</div>}
        {db.tickets.map((tk) => {
          const e = slaState(tk, db.day)
          return (
            <div className="card" style={{ marginBottom: 10, padding: 13 }} key={tk.id}>
              <div className="pcard" style={{ borderLeft: 'none' }}>
                <div className="prow">
                  <span className="pid">{tk.id}</span>
                  <span className="pname">{tk.proj} → {tk.owner}</span>
                  <span className="pills">
                    <span className={`pill ${e.cls}`}>{tk.st} • {e.label}</span>
                    {tk.esc ? <span className="pill p-pur">escalated ×{tk.esc}</span> : null}
                  </span>
                </div>
                <div className="meta">{tk.act}<br />opened day {tk.opened} • {tk.t}{tk.proof ? <><br />proof: {tk.proof}</> : null}</div>
                <div className="bar"><i style={{ width: `${e.pct}%`, background: e.bg }} /></div>
                <div className="pacts">
                  {tk.st === 'Open' && canProof && <button className="btn b sm" onClick={() => submitProof(tk.id)}>Submit proof (photo/NOC)</button>}
                  {tk.st !== 'Closed' && <>
                    <button className="btn g sm" onClick={() => closeTicket(tk.id)} title={tk.proof ? 'Close with proof' : 'Submit proof first — proof-or-no-closure'}>Close with proof</button>
                    <button className="btn r sm" onClick={() => { escalate(tk.id); toast('DO-letter draft waiting in Brief (step 4 RECOMMEND.)', 'info') }}>Escalate</button>
                  </>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Notifications ---------- */
function Notifs() {
  const db = useStore()
  return (
    <div className="panel card">
      <div className="phead"><div><div className="pt">{t('h_notif')}</div><div className="ps">Role-routed alerts — click to mark all read</div></div><div className="grow" />
        <button className="btn o sm" onClick={markAllRead}>{t('btn_readall')}</button></div>
      <div className="pbody">
        {db.notifs.length === 0 && <div className="nores">No notifications yet.</div>}
        {db.notifs.map((n, i) => (
          <div className={`notif${n.unread ? ' unread' : ''}`} key={i} onClick={() => { if (n.unread) markAllRead() }}>
            <div>{n.unread ? '🔵 ' : ''}{n.txt} <span className="mut">→ {n.who}</span></div>
            <div className="t">day {n.d} • {n.t}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Audit ---------- */
function Audit() {
  const db = useStore()
  const ok = verifyChain(db.audit)
  return (
    <div className="panel card">
      <div className="phead"><div><div className="pt">{t('h_audit')}</div><div className="ps">Each entry links to the previous hash — tampering breaks the chain</div></div><div className="grow" />
        <span className={`pill ${ok ? 'p-grn' : 'p-red'}`}>{ok ? 'chain intact ✓' : 'chain broken ✗'}</span></div>
      <div className="pbody">
        {db.audit.length === 0 && <div className="nores">Empty — actions will appear here.</div>}
        {[...db.audit].reverse().map((a, i) => (
          <div className="auditrow" key={i}>
            <b>{a.t}</b><span className="mut">day {a.d}</span><span className="who">{a.by}</span><span>{a.act}</span>
            <span className="when mono">#{a.hash}{a.prev ? ` ← #${a.prev}` : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
