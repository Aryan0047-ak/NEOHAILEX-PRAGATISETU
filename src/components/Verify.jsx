import { useStore } from '../lib/useStore.js'
import { t } from '../lib/i18nToggle.js'
import { health, status } from '../lib/engine.js'
import { verifyClaim } from '../lib/store.js'
import { openProj } from '../lib/uiBus.js'

export default function Verify() {
  const db = useStore()
  return (
    <div className="panel card">
      <div className="phead"><div><div className="pt">{t('h_ver')}</div><div className="ps">Cross-check latest claim against docs and milestones — verdict is hash-audited</div></div></div>
      <div className="pbody">
        {Object.values(db.upd).map((p) => {
          const h = health(p), st = status(h)
          const last = db.hist[p.id] && db.hist[p.id][0]
          const msAvg = Math.round(p.ms.reduce((s, m) => s + m[1], 0) / p.ms.length)
          const claimGap = p.phys - msAvg
          return (
            <div className="card pcard" key={p.id} style={{ marginBottom: 10, borderLeft: `4px solid ${st.color}`, padding: 13 }}>
              <div className="prow">
                <span className="pid" style={{ color: st.color }}>{p.id}</span>
                <span className="pname">{p.name}</span>
                <span className="pills">
                  <span className={`pill ${st.cls}`}>{st.label} {h}</span>
                  {p.flagged ? <span className="pill p-red">flagged</span> : null}
                  {Math.abs(claimGap) > 20 ? <span className="pill p-pur">claim vs milestones gap {claimGap > 0 ? '+' : ''}{claimGap}%</span> : null}
                </span>
              </div>
              <div className="meta">
                Latest claim: {last ? `“${last.txt}” (${last.d})` : `“${p.upd}”`} • photo: {p.photo ? 'yes ✓' : 'NO ✗'}<br />
                Cross-check: milestone avg {msAvg}% vs claimed {p.phys}% • docs: {p.docs.join(', ')}
              </div>
              <div className="pacts">
                <button className="btn g sm" onClick={() => verifyClaim(p.id, 1)}>✓ Confirm</button>
                <button className="btn r sm" onClick={() => verifyClaim(p.id, 0)}>✗ Flag mismatch</button>
                <button className="btn o sm" onClick={() => openProj(p.id)}>Open detail</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
