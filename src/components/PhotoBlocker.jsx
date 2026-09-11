import { useState } from 'react'
import { useStore } from '../lib/useStore.js'
import { t } from '../lib/i18nToggle.js'
import { health, status } from '../lib/engine.js'
import { submitUpdate, raiseBlocker } from '../lib/store.js'

const BLOCKERS = ['Land acquisition', 'Forest clearance', 'Contractor slow', 'Supply chain', 'Billing lag', 'Power link', 'Monsoon', 'Funds release', 'Other']

export default function PhotoBlocker() {
  const db = useStore()
  const [id, setId] = useState('P-101')
  const [phys, setPhys] = useState(65)
  const [fin, setFin] = useState(45)
  const [note, setNote] = useState('')
  const [photo, setPhoto] = useState(true)
  const p = db.upd[id]

  const send = () => {
    if (!note.trim()) { window.alert('Add a short note — judges read these.'); return }
    submitUpdate(id, { phys, fin, upd: note.trim(), photo })
    setNote('')
  }
  const blocker = (b) => raiseBlocker(id, b)

  return (
    <div>
      <div className="panel card">
        <div className="phead"><div><div className="pt">{t('h_ph')}</div><div className="ps">Mobile-ready 5-minute update — geo-tag mock, no real uploads</div></div></div>
        <div className="pbody">
          <div className="row">
            <div className="col" style={{ maxWidth: 320 }}>
              <label className="fl">{t('lbl_proj')}</label>
              <select value={id} onChange={(e) => { setId(e.target.value); const q = db.upd[e.target.value]; setPhys(q.phys); setFin(q.fin) }}>
                {Object.values(db.upd).map((x) => <option key={x.id} value={x.id}>{x.id} — {x.name}</option>)}
              </select>
            </div>
            <div className="col" style={{ maxWidth: 120 }}>
              <label className="fl">Phys %</label>
              <input type="number" min="0" max="100" value={phys} onChange={(e) => setPhys(+e.target.value)} />
            </div>
            <div className="col" style={{ maxWidth: 120 }}>
              <label className="fl">Fin %</label>
              <input type="number" min="0" max="100" value={fin} onChange={(e) => setFin(+e.target.value)} />
            </div>
          </div>
          <label className="fl">{t('lbl_note')}</label>
          <input placeholder="e.g. girder casting done — 80 girders on site" value={note} onChange={(e) => setNote(e.target.value)} />
          <label className="fl">{t('lbl_photo')}</label>
          <button type="button" className={`btn sm ${photo ? 'g' : 'o'}`} onClick={() => setPhoto(!photo)} style={{ marginBottom: 8 }}>
            {photo ? '📷 Geo-photo attached (mock GPS 26.8N, 80.9E)' : '📷 No photo attached — click to attach'}
          </button>
          <div className="pacts">
            <button className="btn g" onClick={send}>Submit update {photo ? '+ photo ✓' : '(no photo)'}</button>
          </div>
          {!photo && phys >= 60 && <div className="err">Claiming ≥60% without a photo will raise the “no photo on claim” anomaly for Review Officer.</div>}
          <label className="fl">Raise a blocker instead</label>
          <div className="pacts">
            {BLOCKERS.map((b) => <button key={b} className="btn o sm" onClick={() => blocker(b)}>{b}</button>)}
          </div>
        </div>
      </div>

      <div className="panel card">
        <div className="phead"><div><div className="pt">Recent update feed</div><div className="ps">What Review Officer sees after each submit</div></div></div>
        <div className="pbody">
          {Object.values(db.upd).filter((x) => db.hist[x.id].length).slice(0, 6).map((x) => {
            const h = health(x), st = status(h)
            const last = db.hist[x.id][0]
            return (
              <div className="card pcard" key={x.id} style={{ marginBottom: 8, borderLeft: `4px solid ${st.color}`, padding: 11 }}>
                <div className="prow">
                  <span className="pid" style={{ color: st.color }}>{x.id}</span>
                  <span className="pname">{last.txt}</span>
                  <span className="pills">
                    {last.photo ? <span className="pill p-grn">photo ✓</span> : <span className="pill p-red">no photo</span>}
                    <span className={`pill ${st.cls}`}>H{h}</span>
                  </span>
                </div>
                <div className="meta" style={{ marginBottom: 0 }}>{last.d} • session submission</div>
              </div>
            )
          })}
          {Object.values(db.upd).every((x) => !db.hist[x.id].length) && <div className="nores">No submissions this session yet.</div>}
        </div>
      </div>
    </div>
  )
}
