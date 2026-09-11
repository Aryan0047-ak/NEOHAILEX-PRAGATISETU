import { useStore } from '../lib/useStore.js'
import { health, status, costOfDelay, riskScore } from '../lib/engine.js'
import { openAI, openProj } from '../lib/uiBus.js'

export default function Projects({ q, setQ, filter, setFilter }) {
  const db = useStore()
  const all = Object.values(db.upd)
    .filter((p) => (p.id + p.name + p.min + p.blocker).toLowerCase().includes(q.toLowerCase()))
    .filter((p) => { const h = health(p); return !filter || status(h).label === filter })
    .sort((a, b) => costOfDelay(b) - costOfDelay(a))

  return (
    <div>
      <div className="row noprint" style={{ marginBottom: 12 }}>
        <div className="col" style={{ maxWidth: 340 }}><input placeholder="Search id / name / ministry / blocker…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="col" style={{ maxWidth: 180 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option><option>CRITICAL</option><option>AT RISK</option><option>ON TRACK</option>
          </select>
        </div>
        <div className="mut" style={{ alignSelf: 'center', fontSize: 12 }}>{all.length} of {Object.values(db.upd).length} projects</div>
      </div>

      {all.length === 0 && <div className="card nores">No projects match “{q}”. Clear the search or filter.</div>}

      <div className="panel card" style={{ overflow: 'hidden' }}>
        <table>
          <thead><tr><th>ID</th><th>Project</th><th>Ministry</th><th>Health</th><th>Risk</th><th>Phys/Fin</th><th>Overdue</th><th>₹cr/wk</th><th>Blocker</th><th></th></tr></thead>
          <tbody>
            {all.map((p) => {
              const h = health(p), st = status(h)
              return (
                <tr key={p.id} onClick={() => openProj(p.id)} style={{ cursor: 'pointer' }}>
                  <td><b style={{ color: st.color }}>{p.id}</b></td>
                  <td>{p.name}</td>
                  <td className="mut">{p.min}</td>
                  <td><span className={`pill ${st.cls}`}>{h}</span></td>
                  <td><span className="pill p-gry">{riskScore(p, db)}</span></td>
                  <td>{p.phys}% / {p.fin}%</td>
                  <td>{p.over}d</td>
                  <td>₹{costOfDelay(p)}</td>
                  <td className="mut">{p.blocker}</td>
                  <td><button className="btn o sm" onClick={(e) => { e.stopPropagation(); openAI(p.id) }}>AI Card</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
