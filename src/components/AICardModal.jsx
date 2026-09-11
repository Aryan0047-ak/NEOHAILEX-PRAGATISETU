import { useState, useEffect } from 'react'
import { useStore } from '../lib/useStore.js'
import { health, status, anomalies, costOfDelay, riskScore, forecast } from '../lib/engine.js'
import { approveCard, rejectCard } from '../lib/store.js'
import { onAI, openWhatIf } from '../lib/uiBus.js'

export default function AICardModal() {
  const db2 = useStore()
  const [id, setId] = useState(null)
  useEffect(() => onAI(setId), [])
  const p = id ? db2.upd[id] : null
  const [owner, setOwner] = useState('')

  useEffect(() => { if (p) setOwner(p.owner) }, [id]) // eslint-disable-line

  if (!p) return null
  const h = health(p), st = status(h)
  const conf = p.photo ? 62 : 84
  const an = anomalies(p, db2.hist[p.id])
  const f = forecast(p)
  const ev = `Overdue ${p.over}d • Var ${Math.abs(p.phys - p.fin)}%`
    + (an.length ? ` • ${an.map((a) => a.label).join(' • ')}` : '')
    + ` • Text '${p.upd}' • ${p.photo ? 'photo OK' : 'NO photo'} • Dep ${p.dep.join(', ') || 'none'} • Blocker: ${p.blocker}`
  const rec = p.dep.length
    ? `Escalate ${p.dep.join(', ')} owner — 14d SLA + parallel work`
    : `Notice to ${p.owner}, verification in 7d`

  return (
    <div className="modal-back" onClick={() => setId(null)}>
      <div className="modal-box card" onClick={(e) => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="mt">🤖 Evidence AI Card — {p.id}</div>
            <div className="ms">{p.name} · {p.min} · ₹{p.cost}cr</div>
          </div>
          <span className="pill p-blu" style={{ marginLeft: 'auto' }}>Confidence {conf}%</span>
          <span className={`pill ${st.cls}`}>{st.label} {h}</span>
          <button className="mclose" onClick={() => setId(null)}>×</button>
        </div>
        <div className="mbody">
          <div className="msec red">
            <div className="st">Claim</div>
            {p.over > 18 ? 'Stalled — intervention needed' : 'Watch — momentum falling'}
            <span style={{ float: 'right', fontWeight: 700 }}>Risk {riskScore(p, db2)}/100 · projected +{f.projectedDelay}d</span>
          </div>
          <div className="msec">
            <div className="st">Evidence</div>
            {ev}
          </div>
          <div className="msec">
            <div className="st">Source · Time</div>
            MIS snapshot + {p.docs[0]} · {new Date().toLocaleString()} <span className="mut">(SYNTHETIC)</span>
          </div>
          <div className="msec blue">
            <div className="st">Recommendation</div>
            {rec}<br />
            <span className="mut">Owner {p.owner} • SLA 14d • cost-of-delay ₹{costOfDelay(p)}cr/wk</span>
          </div>

          <label className="fl">Assign owner</label>
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            {db2.users.filter((u) => u.r === 'Project Officer').map((u) => <option key={u.u} value={u.n}>{u.n}</option>)}
            <option value={p.owner}>{p.owner} (current)</option>
          </select>

          <label className="fl">Draft DO-letter (editable, auto-attached on approve)</label>
          <textarea rows={4} defaultValue={`Dear Sir,\n\n${p.id} (${p.name}) is delayed ${p.over}d due to ${p.blocker}. Cost-of-delay ₹${costOfDelay(p)}cr/week. Request action plan in 14 days with geo-tagged proof.\n\n— Secretary, MoSPI`} />
        </div>
        <div className="mfoot">
          <button className="btn o" onClick={() => { setId(null); openWhatIf(p.id) }}>What-if</button>
          <button className="btn" onClick={() => { rejectCard(p.id); setId(null) }}>Reject</button>
          <button className="btn g" onClick={() => { approveCard(p.id, owner); setId(null) }}>Approve + Assign (14d SLA)</button>
        </div>
      </div>
    </div>
  )
}
