import { useStore } from '../lib/useStore.js'
import { t } from '../lib/i18nToggle.js'
import { health, status, anomalies, costOfDelay } from '../lib/engine.js'
import { openAI, openProj } from '../lib/uiBus.js'
import { verifyClaim } from '../lib/store.js'

export default function Triage() {
  const db = useStore()
  const flagged = Object.values(db.upd)
    .filter((p) => anomalies(p, db.hist[p.id]).length > 0)
    .sort((a, b) => anomalies(b, db.hist[b.id]).length - anomalies(a, db.hist[a.id]).length || costOfDelay(b) - costOfDelay(a))

  return (
    <div className="panel card">
      <div className="phead"><div><div className="pt">{t('h_tri')}</div><div className="ps">Anomaly-first queue — flag copy-paste reporting, route cases to AI Cards</div></div></div>
      <div className="pbody">
        {flagged.length === 0 && <div className="nores">No anomalies — queue clean. Submit field updates as Project Officer or advance the clock to regenerate anomalies.</div>}
        {flagged.map((p) => {
          const h = health(p), st = status(h)
          return (
            <div className="card pcard" key={p.id} style={{ marginBottom: 10, borderLeft: `4px solid ${st.color}`, padding: 13 }}>
              <div className="prow">
                <span className="pid" style={{ color: st.color }}>{p.id}</span>
                <span className="pname">{p.name}</span>
                <span className="pills">
                  <span className={`pill ${st.cls}`}>{st.label} {h}</span>
                  {anomalies(p, db.hist[p.id]).map((a) => <span key={a.label} className={`pill ${a.cls}`}>{a.label}</span>)}
                </span>
              </div>
              <div className="meta">Latest claim: “{p.upd}” • last photo: {p.photo ? 'yes ✓' : 'NO ✗'} • ₹{costOfDelay(p)}cr/wk</div>
              <div className="pacts">
                <button className="btn b sm" onClick={() => openAI(p.id)}>🤖 AI Card</button>
                <button className="btn o sm" onClick={() => openProj(p.id)}>Detail</button>
                <button className="btn r sm" onClick={() => verifyClaim(p.id, 0)}>Flag false reporting</button>
              </div>
            </div>
          )
        })}
        <div className="mut" style={{ marginTop: 8, fontSize: 11.5 }}>Detection rules: phys-fin gap &gt;15% • no-photo on ≥60% claim • repeated update text (stall pattern) • overdue &gt;30d.</div>
      </div>
    </div>
  )
}
