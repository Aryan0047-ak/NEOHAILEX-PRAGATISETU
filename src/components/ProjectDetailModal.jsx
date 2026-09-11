import { useState, useEffect, useRef } from 'react'
import { useStore } from '../lib/useStore.js'
import { health, status, anomalies, costOfDelay, riskScore, forecast } from '../lib/engine.js'
import { submitUpdate, toast } from '../lib/store.js'
import { onProj, openAI, openWhatIf } from '../lib/uiBus.js'

// Downscale to max 480px JPEG so real photos stay tiny in localStorage.
function fileToThumb(file) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => {
      const s = Math.min(1, 480 / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(img.src)
      res(c.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = rej
    img.src = URL.createObjectURL(file)
  })
}

// Global project detail modal — registered once in Shell so openProj(id)
// works from ANYWHERE: palette, map pins, triage, command, notifications.
export default function ProjectDetailModal() {
  const db = useStore()
  const [id, setId] = useState(null)
  useEffect(() => onProj(setId), []) // register once on mount
  const p = id ? db.upd[id] : null
  if (!p) return null
  return <Detail id={id} close={() => setId(null)} />
}

function Detail({ id, close }) {
  const db = useStore()
  const p = db.upd[id]
  const h = health(p), st = status(h), an = anomalies(p, db.hist[p.id])
  const f = forecast(p)
  const tk = db.tickets.find((x) => x.proj === id && x.st !== 'Closed')
  const [phys, setPhys] = useState(p.phys)
  const [fin, setFin] = useState(p.fin)
  const [upd, setUpd] = useState(p.upd)
  const [saved, setSaved] = useState(false)
  const [shot, setShot] = useState(null) // real attached photo (data URL)
  const fileRef = useRef(null)

  const pick = async (f) => {
    if (!f) return
    try { setShot(await fileToThumb(f)); toast('Photo attached ✓', 'ok') }
    catch { toast('Could not read that image', 'err') }
  }
  const submitPhoto = () => {
    if (!shot) { toast('Attach a site photo first — proof-or-no-closure', 'warn'); fileRef.current && fileRef.current.click(); return }
    submitUpdate(id, { phys, fin, upd, photo: 1, photoData: shot }); setSaved(true); setShot(null)
  }

  const W = 300
  const pts = (arr, scale) => arr.map((pt, i) => `${12 + i * ((W - 24) / Math.max(1, arr.length - 1))},${86 - Math.min(80, pt.v * scale)}`).join(' ')

  return (
    <div className="modal-back" onClick={close}>
      <div className="modal-box card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 780 }}>
        <div className="mhead">
          <div>
            <div className="mt">{p.id} — {p.name}</div>
            <div className="ms">{p.min} | {p.state} | DL {p.dl} | Owner {p.owner} | Blocker <b>{p.blocker}</b></div>
          </div>
          <span className={`pill ${st.cls}`} style={{ marginLeft: 'auto' }}>{st.label} {h}</span>
          <button className="mclose" onClick={close}>×</button>
        </div>
        <div className="mbody">
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="pill p-gry">risk {riskScore(p, db)}</span>
            {an.map((a) => <span key={a.label} className={`pill ${a.cls}`}>{a.label}</span>)}
            {tk ? <span className="pill p-yel">Ticket {tk.id} • {tk.st} • SLA {tk.sla - db.day}d</span> : null}
            <span className="pill p-blu">projected +{f.projectedDelay}d</span>
          </div>

          <div className="row">
            <div className="col">
              <div className="st" style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--faint)', letterSpacing: '.8px', marginBottom: 6 }}>MILESTONES (dashed = planned)</div>
              <div className="gantt">
                {p.ms.map(([name, pct], i) => (
                  <div className="grow2" key={i}>
                    <div className="glabel">{name}</div>
                    <div className="gtrack">
                      <div className="gbar planned" style={{ left: 0, width: `${Math.min(100, pct + 18)}%` }} />
                      <div className="gbar" style={{ left: 0, width: `${pct}%`, background: pct < 40 ? 'var(--red)' : pct < 70 ? 'var(--amber)' : 'var(--green)' }} />
                    </div>
                    <span className="mut">{pct}%</span>
                  </div>
                ))}
              </div>
              <div className="legend"><span><span className="sw" style={{ background: 'var(--green)' }} />actual</span><span>dashed = plan</span></div>
            </div>

            <div className="col">
              <div className="st" style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--faint)', letterSpacing: '.8px', marginBottom: 6 }}>EVM BURN ₹cr/mo (blue=actual, grey dashed=plan, red=trend)</div>
              <svg width="100%" height="96" viewBox={`0 0 ${W} 96`} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8 }}>
                <polyline points={pts(f.plannedPts, 3)} fill="none" stroke="#9ca3af" strokeWidth="1.6" strokeDasharray="4,3" />
                <polyline points={pts(f.pts, 3)} fill="none" stroke="var(--blue)" strokeWidth="2.2" />
                <polyline points={pts(f.trend, 3)} fill="none" stroke="#dc2626" strokeWidth="1.6" strokeDasharray="2,3" />
              </svg>
              <div className="legend"><span>pace {Math.round(f.pace * 100)}% of plan</span><span>~{f.monthsLeft}mo left at current rate</span></div>
              <div className="st" style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--faint)', letterSpacing: '.8px', margin: '10px 0 6px' }}>DOCUMENTS</div>
              {p.docs.map((d) => <span className="doc" key={d} onClick={() => window.alert(`Document viewer (demo): ${d}`)}>📄 {d}</span>)}
            </div>
          </div>

          <div className="st" style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--faint)', letterSpacing: '.8px', margin: '12px 0 4px' }}>UPDATE FEED</div>
          <div className="tl">
            {db.hist[id].concat((p.tl || []).map(([d, txt]) => ({ d, txt, photo: null }))).slice(0, 6).map((x, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {x.img ? <img src={x.img} alt="site proof" style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)' }} /> : null}
                <div><b>{x.d}</b> — {x.txt} {x.photo === 1 ? <span className="pill p-grn">photo ✓</span> : x.photo === 0 ? <span className="pill p-red">no photo</span> : null}</div>
              </div>
            ))}
            {p.photoData && <div style={{ marginTop: 6 }}><span className="mut">Latest site photo:</span><br /><img src={p.photoData} alt="latest site proof" style={{ width: 180, borderRadius: 8, border: '1px solid var(--line)', marginTop: 4 }} /></div>}
          </div>

          <div className="row" style={{ marginTop: 10, alignItems: 'flex-end' }}>
            <div className="col" style={{ maxWidth: 130 }}><label className="fl">Phys %</label><input type="number" min="0" max="100" value={phys} onChange={(e) => setPhys(+e.target.value)} /></div>
            <div className="col" style={{ maxWidth: 130 }}><label className="fl">Fin %</label><input type="number" min="0" max="100" value={fin} onChange={(e) => setFin(+e.target.value)} /></div>
            <div className="col"><label className="fl">Note</label><input value={upd} onChange={(e) => { setUpd(e.target.value); setSaved(false) }} /></div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => pick(e.target.files[0])} />
            <button className="btn o" onClick={() => fileRef.current && fileRef.current.click()}>{shot ? '↻ Change photo' : '📷 Attach photo'}</button>
            {shot && <img src={shot} alt="attached preview" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6, border: '2px solid var(--green)' }} />}
            <button className="btn g" onClick={submitPhoto}>Submit + Photo</button>
            <button className="btn o" onClick={() => { submitUpdate(id, { phys, fin, upd, photo: 0 }); setSaved(true) }}>No photo</button>
          </div>
          {saved && <div className="okmsg">Update saved — visible to Review Officer instantly.</div>}
        </div>
        <div className="mfoot">
          <button className="btn o" onClick={() => { close(); setTimeout(() => openWhatIf(id), 0) }}>⚡ What-if</button>
          <button className="btn b" onClick={() => { close(); setTimeout(() => openAI(id), 0) }}>🤖 Evidence AI Card</button>
        </div>
      </div>
    </div>
  )
}
