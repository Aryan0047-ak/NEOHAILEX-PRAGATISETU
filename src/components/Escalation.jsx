import { useState } from 'react'
import { useStore } from '../lib/useStore.js'
import { t } from '../lib/i18nToggle.js'
import { slaState } from '../lib/engine.js'
import { escalate, advanceDay, toast } from '../lib/store.js'
import { openAI } from '../lib/uiBus.js'

export default function Escalation() {
  const db = useStore()
  const [bump, setBump] = useState(0)
  const next = () => { const od = advanceDay(); setBump(bump + 1); toast(`Day ${db.day + 1} — ${od.length ? od.length + ' ticket(s) past SLA' : 'all SLAs healthy'}`, od.length ? 'warn' : 'ok') }
  const ladder = [
    ['T-2d', 'Reminder to owner + RO', 'p-blu'],
    ['T-0', 'Red alert — owner + RO', 'p-red'],
    ['+3d', 'Escalate to Secretary — DO-letter auto-drafted', 'p-pur'],
    ['+7d', 'Systemic tag — repeat-delay registry', 'p-pur'],
  ]
  return (
    <div>
      <div className="klistrip panel">
        <div className="cell"><div className="cl">Demo day</div><div className="cv">{db.day}{bump ? '' : ''}</div><div className="cs">advance to stress the ladder</div></div>
        <div className="cell"><div className="cl">Tickets tracked</div><div className="cv">{db.tickets.length}</div><div className="cs">14d SLA each</div></div>
        <div className="cell"><div className="cl">Past SLA</div><div className="cv" style={{ color: 'var(--red)' }}>{db.tickets.filter((x) => x.st !== 'Closed' && x.sla - db.day < 0).length}</div><div className="cs">auto-escalate when Live ops is on</div></div>
      </div>
      <div className="panel card">
        <div className="phead"><div><div className="pt">{t('h_esc')}</div><div className="ps">{t('esc_ladder')}</div></div><div className="grow" />
          <button className="btn b sm" onClick={next}>⏩ Advance day</button></div>
      <div className="pbody">
        <div className="row" style={{ marginBottom: 12 }}>
          {ladder.map(([k, v, c]) => (
            <div className="card" key={k} style={{ flex: 1, minWidth: 150, padding: 10 }}>
              <span className={`pill ${c}`}>{k}</span>
              <div style={{ fontSize: 11.5, marginTop: 6, lineHeight: 1.4 }}>{v}</div>
            </div>
          ))}
        </div>
        {db.tickets.length === 0 && (
          <div className="nores">No tickets yet — approve an Evidence AI Card (Command screen) to start a 14-day SLA clock.<br /><br />
            <button className="btn b sm" onClick={() => openAI('P-101')}>Open AI Card for P-101</button>
          </div>
        )}
        {db.tickets.map((tk) => {
          const e = slaState(tk, db.day)
          return (
            <div className="card pcard" key={tk.id} style={{ marginBottom: 10, padding: 13 }}>
              <div className="prow">
                <span className="pid">{tk.id}</span>
                <span className="pname">{tk.proj} → {tk.owner}</span>
                <span className="pills">
                  <span className={`pill ${e.cls}`}>{tk.st} • {e.label}</span>
                  {tk.esc ? <span className="pill p-pur">escalated ×{tk.esc}</span> : null}
                </span>
              </div>
              <div className="meta">{tk.act} • opened day {tk.opened}{tk.proof ? ` • proof: ${tk.proof}` : ' • no proof yet'}</div>
              <div className="bar"><i style={{ width: `${e.pct}%`, background: e.bg }} /></div>
              {tk.st !== 'Closed' && <div className="pacts" style={{ marginTop: 8 }}><button className="btn r sm" onClick={() => escalate(tk.id)}>Escalate now</button></div>}
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}
