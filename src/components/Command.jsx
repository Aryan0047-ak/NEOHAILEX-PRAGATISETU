import { useStore } from '../lib/useStore.js'
import { t } from '../lib/i18nToggle.js'
import { health, status, anomalies, costOfDelay, riskScore } from '../lib/engine.js'
import { openAI, openWhatIf, openProj } from '../lib/uiBus.js'

export default function Command() {
  const db = useStore()
  const all = Object.values(db.upd)
  let crit = 0, atr = 0, tot = 0
  all.forEach((p) => { const h = health(p); if (h < 45) crit++; else if (h < 70) atr++; tot += costOfDelay(p) })
  const open = db.tickets.filter((x) => x.st !== 'Closed').length

  const sorted = [...all].sort((a, b) => costOfDelay(b) - costOfDelay(a))
  return (
    <div>
      <div className="klistrip panel">
        <div className="cell"><div className="cl">Projects</div><div className="cv">{all.length}</div><div className="cs">synthetic portfolio</div></div>
        <div className="cell"><div className="cl">Critical</div><div className="cv" style={{ color: 'var(--red)' }}>{crit}</div><div className="cs">health &lt; 45</div></div>
        <div className="cell"><div className="cl">At risk</div><div className="cv" style={{ color: 'var(--amber)' }}>{atr}</div><div className="cs">health 45–69</div></div>
        <div className="cell"><div className="cl">Cost-at-risk</div><div className="cv">₹{Math.round(tot * 10) / 10}cr</div><div className="cs">per week</div></div>
        <div className="cell"><div className="cl">Open tickets</div><div className="cv">{open}</div><div className="cs">14d SLA each</div></div>
        <div className="cell"><div className="cl">Audit events</div><div className="cv">{db.audit.length}</div><div className="cs good">hash-chained ✓</div></div>
      </div>

      <div className="panel card">
        <div className="phead"><div><div className="pt">{t('h_triage')}</div><div className="ps">Every card: evidence-backed anomalies, one-click AI Card</div></div></div>
        <div className="pbody">
          {sorted.map((p) => {
            const h = health(p), st = status(h), an = anomalies(p, db.hist[p.id])
            return (
              <div className="card pcard" key={p.id} style={{ marginBottom: 10, borderLeft: `4px solid ${st.color}`, padding: 13 }}>
                <div className="prow">
                  <span className="pid" style={{ color: st.color }}>{p.id}</span>
                  <span className="pname">{p.name}</span>
                  <span className="pills">
                    <span className={`pill ${st.cls}`}>{st.label} {h}</span>
                    <span className="pill p-gry">risk {riskScore(p, db)}</span>
                    {an.map((a) => <span key={a.label} className={`pill ${a.cls}`}>{a.label}</span>)}
                  </span>
                </div>
                <div className="meta">{p.min} | {p.state} | ₹{p.cost}cr | Over {p.over}d | ₹{costOfDelay(p)}cr/wk | Blocker: <b>{p.blocker}</b>{p.dep.length ? <> | blocked-by {p.dep.join(', ')}</> : null}</div>
                <div className="pbars">
                  <div className="pbar"><div className="pl"><span>Physical</span><span>{p.phys}%</span></div><div className="pt2"><i style={{ width: `${p.phys}%`, background: 'var(--blue)' }} /></div></div>
                  <div className="pbar"><div className="pl"><span>Financial</span><span>{p.fin}%</span></div><div className="pt2"><i style={{ width: `${p.fin}%`, background: p.phys - p.fin > 15 ? 'var(--violet)' : 'var(--green)' }} /></div></div>
                </div>
                <div className="pacts">
                  <button className="btn b sm" onClick={() => openAI(p.id)}>🤖 Evidence AI Card</button>
                  <button className="btn o sm" onClick={() => openProj(p.id)}>Detail path</button>
                  <button className="btn o sm" onClick={() => openWhatIf(p.id)}>⚡ What-if</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
