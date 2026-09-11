import { useState, useEffect, useRef } from 'react'
import { useStore } from '../lib/useStore.js'
import { allProjects, advanceDay, markAllRead, exportJSON, resetDemo, toggleLang } from '../lib/store.js'
import { health, status } from '../lib/engine.js'
import { openAI, openWhatIf, openProj } from '../lib/uiBus.js'

// ⌘K command palette: navigate, act on projects, run system commands.
export default function Palette({ close, setView }) {
  const db = useStore()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current && inputRef.current.focus() }, [])

  const cmds = [
    { k: 'Go to Command', i: '📊', run: () => setView('cmd') },
    { k: 'Go to Brief + DO-Letter', i: '📄', run: () => setView('brief') },
    { k: 'Go to Triage Queue', i: '🚦', run: () => setView('tri') },
    { k: 'Go to Verify', i: '🔍', run: () => setView('ver') },
    { k: 'Go to SLA & Escalation', i: '⏰', run: () => setView('esc') },
    { k: 'Go to Projects', i: '📁', run: () => setView('proj') },
    { k: 'Go to Interventions', i: '🎫', run: () => setView('tick') },
    { k: 'Go to Audit Trail', i: '🧾', run: () => setView('audit') },
    { k: 'Advance demo day', i: '⏩', run: () => advanceDay() },
    { k: 'Mark all notifications read', i: '✅', run: () => markAllRead() },
    { k: 'Export JSON snapshot', i: '⬇️', run: () => exportJSON() },
    { k: 'Reset demo data', i: '↺', run: () => resetDemo() },
    { k: 'Toggle हिंदी / EN', i: '🌐', run: () => toggleLang() },
  ]

  const ql = q.toLowerCase()
  const projHits = allProjects().filter((p) => (p.id + ' ' + p.name + ' ' + p.min).toLowerCase().includes(ql)).slice(0, 5)
  const cmdHits = cmds.filter((c) => c.k.toLowerCase().includes(ql)).slice(0, 6)
  const items = [
    ...projHits.map((p) => ({ key: p.id + ' — ' + p.name, i: '🏗', hint: `H${health(p)} ${status(health(p)).label}`, run: () => openProj(p.id) })),
    ...allProjects().filter((p) => p.id && (p.id + ' ' + p.name).toLowerCase().includes(ql) && ql.length > 1).slice(0, 3).map((p) => ({ key: `AI Card — ${p.id}`, i: '🤖', hint: 'open card', run: () => openAI(p.id) })),
    ...cmdHits,
  ]

  const go = (it) => { close(); it.run() }

  return (
    <div className="pal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="pal">
        <input ref={inputRef} placeholder="Search projects, screens, actions…" value={q} onChange={(e) => { setQ(e.target.value); setSel(0) }} />
        <div className="pal-list">
          {items.length === 0 && <div className="pal-empty">No matches for “{q}”</div>}
          {items.map((it, i) => (
            <div key={i} className={`pal-item${i === sel ? ' on' : ''}`} onClick={() => go(it)} onMouseEnter={() => setSel(i)}>
              <span className="pi">{it.i}</span>{it.key}<span className="pk">{it.hint || ''}</span>
            </div>
          ))}
        </div>
        <div className="pal-empty" style={{ padding: 9, borderTop: '1px solid var(--line)', fontSize: 10.5 }}>↑↓ navigate · Enter select · Esc close</div>
      </div>
    </div>
  )
}
