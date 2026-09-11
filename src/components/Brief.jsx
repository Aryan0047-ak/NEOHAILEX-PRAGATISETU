import { useState } from 'react'
import { useStore } from '../lib/useStore.js'
import { t } from '../lib/i18nToggle.js'
import { health, status, costOfDelay } from '../lib/engine.js'
import { getProject, issueDOLetter, toast } from '../lib/store.js'

export default function Brief() {
  const db = useStore()
  const [text, setText] = useState(null)
  const all = Object.values(db.upd)
  const tot = all.reduce((s, p) => s + costOfDelay(p), 0)
  const openT = db.tickets.filter((x) => x.st !== 'Closed').length
  const closedT = db.tickets.filter((x) => x.st === 'Closed').length
  const crit = all.filter((p) => health(p) < 45)
  const p101 = getProject('P-101')

  const gen = () => { setText(defaultLetter(p101, costOfDelay(p101))); toast('DO-letter regenerated from live data', 'ok') }

  return (
    <div>
      <div className="klistrip panel noprint">
        <div className="cell"><div className="cl">Cost-at-risk</div><div className="cv">₹{Math.round(tot * 10) / 10}cr</div><div className="cs">per week</div></div>
        <div className="cell"><div className="cl">Critical</div><div className="cv" style={{ color: 'var(--red)' }}>{crit.length}</div><div className="cs">{crit.map((p) => p.id).join(', ') || 'none'}</div></div>
        <div className="cell"><div className="cl">Tickets</div><div className="cv">{openT}<span style={{ fontSize: 13 }}>/<span style={{ color: 'var(--green)' }}>{closedT}</span></span></div><div className="cs">open / closed</div></div>
      </div>

      <div className="panel card">
        <div className="phead noprint"><div><div className="pt">{t('h_brief')}</div><div className="ps">Auto-generated from live state — print-ready A4</div></div><div className="grow" />
          <button className="btn b sm" onClick={gen}>{t('btn_generate')}</button>
          <button className="btn o sm" onClick={() => window.print()}>🖨 {t('btn_print')}</button>
        </div>
        <div className="pbody">
          <div style={{ borderBottom: '3px double var(--ink)', paddingBottom: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>MoSPI Flash Note — Project Delays & Interventions</div>
            <div className="mut" style={{ fontSize: 11.5 }}>{new Date().toDateString()} • demo day {db.day} • SYNTHETIC DATA — for demonstration only</div>
          </div>
          <table style={{ marginBottom: 12 }}>
            <thead><tr><th>ID</th><th>Project</th><th>Ministry</th><th>Health</th><th>Overdue</th><th>₹cr/wk</th><th>Blocker</th></tr></thead>
            <tbody>
              {[...all].sort((a, b) => costOfDelay(b) - costOfDelay(a)).map((p) => {
                const st = status(health(p))
                return (
                  <tr key={p.id}>
                    <td><b style={{ color: st.color }}>{p.id}</b></td>
                    <td>{p.name}</td>
                    <td className="mut">{p.min}</td>
                    <td><span className={`pill ${st.cls}`}>{health(p)}</span></td>
                    <td>{p.over}d</td>
                    <td>₹{costOfDelay(p)}</td>
                    <td className="mut">{p.blocker}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="msec blue" style={{ marginBottom: 12 }}>
            <div className="st">Secretary's summary</div>
            {crit.length ? `${crit.length} critical case(s): ${crit.map((p) => p.id).join(', ')}. ` : ''}
            Priority: clear P-118 Forest Clearance Stage-II within 14 days — this single approval unlocks the ₹842cr P-101 corridor.
            {openT ? ` ${openT} intervention ticket(s) currently running with named owners.` : ''} Every closure requires geo-tagged proof; every action is hash-audited.
          </div>
          <h3 style={{ margin: '4px 0 6px' }}>DO-letter (editable draft)</h3>
          <textarea rows={7} className="screenonly" value={text ?? defaultLetter(p101, costOfDelay(p101))} onChange={(e) => setText(e.target.value)} style={{ fontFamily: 'Georgia, serif', fontSize: 13 }} />
          <div className="printonly letter-print">{text ?? defaultLetter(p101, costOfDelay(p101))}</div>
          <div className="noprint" style={{ marginTop: 8 }}>
            <button className="btn g" onClick={() => { issueDOLetter(); }}>Issue + log to audit</button>
            <span className="mut" style={{ fontSize: 11.5, marginLeft: 8 }}>Issuing hashes the letter into the tamper-evident trail.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function defaultLetter(p, cr) {
  return `D.O. No. MoSPI/PS/2026/—\n\nDear Sir,\n\nProject ${p.id} — ${p.name.replace(/^P-101 /, '')} is delayed ${p.over} days against the approved timeline, principally due to pending Forest Clearance Stage-II (P-118). The cost-of-delay is assessed at ₹${cr} crore per week.\n\nKindly accord Stage-II clearance within 14 days and confirm compliance with geo-tagged photographic evidence through the PRAGATI SETU portal.\n\nYours faithfully,\n\nSecretary, MoSPI\n(SYNTHETIC demo letter)`
}
