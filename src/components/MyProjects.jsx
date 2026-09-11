import { useStore } from '../lib/useStore.js'
import { t } from '../lib/i18nToggle.js'
import { health, status, costOfDelay } from '../lib/engine.js'
import { openProj, openAI } from '../lib/uiBus.js'

export default function MyProjects({ goPhoto }) {
  const db = useStore()
  // Project Officer desk: prioritize their open tickets; show all as portfolio fallback
  const mine = Object.values(db.upd)
    .map((p) => ({ p, tk: db.tickets.find((x) => x.proj === p.id && x.st !== 'Closed') }))
    .sort((a, b) => (b.tk ? 1 : 0) - (a.tk ? 1 : 0) || costOfDelay(b.p) - costOfDelay(a.p))

  return (
    <div>
      <div className="panel card" style={{ padding: '12px 16px', marginBottom: 12, background: 'var(--blue-soft)', borderColor: '#c6d8fb' }}>
        <b>5-minute discipline:</b> update → attach geo-photo → submit. Photo-backed updates reduce overdue days by 7 and clear the no-photo anomaly automatically.
      </div>
      <div className="panel card">
        <div className="phead"><div><div className="pt">{t('h_upd')}</div><div className="ps">Your assigned tickets float to the top — SLA countdown live</div></div></div>
        <div className="pbody">
          {mine.map(({ p, tk }) => {
            const h = health(p), st = status(h)
            return (
              <div className="card pcard" key={p.id} style={{ marginBottom: 10, borderLeft: `4px solid ${st.color}`, padding: 13 }}>
                <div className="prow">
                  <span className="pid" style={{ color: st.color }}>{p.id}</span>
                  <span className="pname">{p.name}</span>
                  <span className="pills">
                    <span className={`pill ${st.cls}`}>{st.label} {h}</span>
                    {tk ? <span className="pill p-yel">Ticket {tk.id} • SLA {tk.sla - db.day}d</span> : null}
                    {p.photo ? <span className="pill p-grn">photo ✓</span> : <span className="pill p-red">no photo</span>}
                  </span>
                </div>
                <div className="meta">{p.min} | DL {p.dl} | blocker: <b>{p.blocker}</b> | ₹{costOfDelay(p)}cr/wk</div>
                <div className="pacts">
                  <button className="btn o sm" onClick={() => openProj(p.id)}>Open detail & update</button>
                  <button className="btn b sm" onClick={() => openAI(p.id)}>🤖 AI Card</button>
                  {goPhoto && <button className="btn sm" onClick={goPhoto}>📷 {t('nav_ph')}</button>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
