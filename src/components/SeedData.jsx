import { useStore } from '../lib/useStore.js'
import { t } from '../lib/i18nToggle.js'
import { allProjects, resetDemo, purge, exportJSON, toast } from '../lib/store.js'

export default function SeedData() {
  const db = useStore()
  const oc = db.tickets.filter((x) => x.st === 'Closed').length
  let bytes = 0
  try { bytes = (localStorage.getItem('setu') || '').length } catch { /* ignore */ }
  return (
    <div>
      <div className="klistrip panel">
        <div className="cell"><div className="cl">Projects</div><div className="cv">{allProjects().length}</div><div className="cs">synthetic seed</div></div>
        <div className="cell"><div className="cl">Tickets open/closed</div><div className="cv">{db.tickets.length - oc}/{oc}</div><div className="cs">this store</div></div>
        <div className="cell"><div className="cl">Audit events</div><div className="cv">{db.audit.length}</div><div className="cs good">hash-chained</div></div>
        <div className="cell"><div className="cl">Demo day</div><div className="cv">{db.day}</div><div className="cs">mock clock</div></div>
        <div className="cell"><div className="cl">Storage</div><div className="cv">{(bytes / 1024).toFixed(1)}<span style={{ fontSize: 13 }}>kb</span></div><div className="cs">localStorage “setu”</div></div>
      </div>
      <div className="panel card">
        <div className="phead"><div><div className="pt">{t('h_seed')}</div><div className="ps">Mock backend console — the same actions a real API would expose</div></div></div>
        <div className="pbody">
          <div className="pacts" style={{ marginBottom: 10 }}>
            <button className="btn g" onClick={resetDemo}>↺ {t('seed_reload')}</button>
            <button className="btn r" onClick={() => { if (window.confirm('Purge all demo data (SYNTHETIC)?')) { purge(); toast('Store purged — fresh seed loaded', 'ok') } }}>🗑 {t('seed_purge')}</button>
            <button className="btn o" onClick={exportJSON}>⬇ {t('seed_export')}</button>
          </div>
          <div className="mut" style={{ fontSize: 12, lineHeight: 1.7 }}>
            Persistence: localStorage key <span className="mono">setu</span> • schema v1 • RBAC password auth • demo clock manual + live-ops<br />
            Swap <span className="mono">src/lib/store.js</span> persist/load for fetch() calls to attach a real backend — components are already decoupled.
          </div>
        </div>
      </div>
    </div>
  )
}
