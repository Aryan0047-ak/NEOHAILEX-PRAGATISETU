import { useState } from 'react'
import { login, allProjects } from '../lib/store.js'
import { health, status, costOfDelay } from '../lib/engine.js'
import { useStore } from '../lib/useStore.js'
import { t as tr } from '../lib/i18nToggle.js'

const QUICK = [
  { u: 'secy-mospi', pw: 'setu123', n: 'Secretary', d: 'Command centre + briefs' },
  { u: 'ro-triage', pw: 'setu123', n: 'Review Officer', d: 'Triage + verify + SLA' },
  { u: 'ee-sharma', pw: 'setu123', n: 'Project Officer', d: '5-min field updates' },
  { u: 'admin-demo', pw: 'admin123', n: 'Admin', d: 'Users + seed data' },
]

export default function Login() {
  const db = useStore()
  const [u, setU] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')

  const submit = (e) => {
    if (e) e.preventDefault()
    const r = login(u.trim(), pw)
    if (!r.ok) setErr(r.reason === 'disabled' ? tr('login_disabled') : tr('login_err'))
    else setErr('')
  }
  const quick = (c) => { setU(c.u); setPw(c.pw); setErr('') }

  const matches = q ? allProjects().filter((p) =>
    (p.id + p.name + p.min + p.blocker).toLowerCase().includes(q.toLowerCase())) : []

  return (
    <div className="login">
      <div className="lhero">
        <div className="lg"><div className="brandglyph">प</div> PRAGATI SETU</div>
        <h1>From late reports<br />to owned, proven action.</h1>
        <div className="lsub">The action-closure layer on PAIMANA — every detected delay becomes an owned intervention with a 14-day SLA, geo-tagged proof, and a tamper-evident audit trail.</div>
        <div className="flowchips">
          <div className="chip"><b>DETECT</b> anomalies in claims — phys-fin gaps, no-photo, copy-paste stalls</div>
          <div className="chip"><b>DECIDE</b> Evidence AI Card → human approval → named owner, 14-day SLA</div>
          <div className="chip"><b>PROVE</b> NOC/photo closure → hash-chained audit → the loop repeats</div>
        </div>
        <div className="lfoot">SYNTHETIC DEMO DATA • NO ML TRAINING • OFFLINE-CAPABLE • RBAC PASSWORD AUTH</div>
      </div>

      <div className="lpanel">
        <div className="lcard">
          <h2>Sign in</h2>
          <div className="lhint">Role-based access — pick a demo persona or type credentials.</div>

          <div className="demoquick">
            {QUICK.map((c) => (
              <button className="dq" key={c.u} onClick={() => quick(c)}>
                <b>{c.n}</b>{c.u} · {c.d}
              </button>
            ))}
          </div>

          <form onSubmit={submit}>
            <label className="fl">{tr('login_user')}</label>
            <input value={u} onChange={(e) => setU(e.target.value)} placeholder="username" autoComplete="username" />
            <label className="fl">{tr('login_pw')}</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="password" autoComplete="current-password" />
            {err && <div className="err">{err}</div>}
            <button className="lbtn" type="submit">{tr('login_btn')}</button>
          </form>

          <details className="creds">
            <summary>Public transparency search (no login) →</summary>
            <input style={{ marginTop: 8 }} placeholder="Search 10 synthetic projects…" value={q} onChange={(e) => setQ(e.target.value)} />
            {matches.map((p) => {
              const h = health(p), st = status(h)
              return (
                <div className="card" key={p.id} style={{ marginTop: 6, padding: 10 }}>
                  <b>{p.id}</b> <span className={`pill ${st.cls}`}>{st.label} {h}</span>
                  <div style={{ fontSize: 12 }}>{p.name}</div>
                  <div className="mut" style={{ fontSize: 11 }}>{p.min} | ₹{p.cost}cr | ₹{costOfDelay(p)}cr/wk | {p.blocker}</div>
                </div>
              )
            })}
            {q && matches.length === 0 && <div className="mut" style={{ fontSize: 12, padding: 8 }}>No match.</div>}
          </details>

          <table className="creds">
            <thead><tr><th>{tr('creds_user')}</th><th>{tr('creds_pw')}</th><th>{tr('creds_role')}</th></tr></thead>
            <tbody>
              {QUICK.map((c) => (
                <tr key={c.u}><td className="mono">{c.u}</td><td className="mono">{c.pw}</td><td>{c.d}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
