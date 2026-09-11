import { useState, useEffect } from 'react'
import { useStore } from '../lib/useStore.js'
import { health, costOfDelay, forecast } from '../lib/engine.js'
import { submitWhatIf } from '../lib/store.js'
import { onWhatIf } from '../lib/uiBus.js'

export default function WhatIfModal() {
  const db = useStore()
  const [id, setId] = useState(null)
  const [extra, setExtra] = useState(0)
  useEffect(() => onWhatIf((pid) => { setId(pid); setExtra(0) }), [])
  const p = id ? db.upd[id] : null
  if (!p) return null

  const over = p.over + extra
  const h2 = Math.max(4, Math.round(100 - over * 1.2 - Math.abs(p.phys - p.fin) * 0.8 - (p.photo ? 0 : 9) - (p.upd === 'work in progress' ? 7 : 0) - (p.flagged ? 10 : 0)))
  const cr = Math.round(p.cost * 0.002 * over / 7 * 10) / 10
  const depNames = p.dep.join(', ') || 'none'

  return (
    <div className="modal-back" onClick={() => setId(null)}>
      <div className="modal-box card" onClick={(e) => e.stopPropagation()}>
        <div className="mhead">
          <div>
            <div className="mt">⚡ What-if — delay scenario</div>
            <div className="ms">{p.id} — {p.name}</div>
          </div>
          <button className="mclose" onClick={() => setId(null)}>×</button>
        </div>
        <div className="mbody">
          <label className="fl">Extra delay: <b style={{ fontSize: 14 }}>{extra}</b> days</label>
          <input type="range" min="0" max="60" value={extra} onChange={(e) => setExtra(+e.target.value)} style={{ width: '100%', accentColor: 'var(--blue)' }} />
          <div className="msec">
            <div className="st">Impact projection</div>
            Health <b>{health(p)}</b> → <b style={{ color: h2 < 45 ? 'var(--red)' : h2 < 70 ? 'var(--amber)' : 'var(--green)' }}>{h2}</b>
            <br />Cost-of-delay ₹{costOfDelay(p)}cr/wk → <b>₹{cr}cr/wk</b>
            <br />Downstream ({depNames}) stay blocked{extra ? ` +${extra}d` : ''}
          </div>
          <div className="msec amber-box msec" style={{ background: 'var(--amber-soft)', borderColor: '#f3e2c0' }}>
            <div className="st">Decision preview</div>
            {h2 < 45 ? 'At this point the project crosses into CRITICAL — the system would auto-recommend an Evidence AI Card and Secretary escalation.' : h2 < 70 ? 'AT RISK band — monthly review recommended.' : 'Still ON TRACK — no action needed yet.'}
          </div>
        </div>
        <div className="mfoot">
          <button className="btn" onClick={() => setId(null)}>Close</button>
          <button className="btn b" disabled={extra === 0} onClick={() => { submitWhatIf(p.id, extra); setId(null) }}>Accept scenario (+{extra}d)</button>
        </div>
      </div>
    </div>
  )
}
