import { useState, useEffect } from 'react'
import { useStore } from '../lib/useStore.js'
import { health, status, anomalies, costOfDelay, riskScore, forecast } from '../lib/engine.js'
import { allProjects } from '../lib/store.js'
import { openAI, openWhatIf } from '../lib/uiBus.js'

// AI Copilot drawer — rule-based "analyst" that explains the portfolio and
// recommends the next action. No ML, no external API: deterministic insights.
export default function Copilot() {
  const db = useStore()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState(null)

  useEffect(() => {
    const h = (e) => { if (e.altKey && (e.key === 'c' || e.key === 'C')) { e.preventDefault(); setOpen((v) => !v) } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  if (!open) {
    return <button className="copilotfab noprint" onClick={() => setOpen(true)} title="Alt+C">✦ Copilot</button>
  }

  const all = allProjects()
  const worst = [...all].sort((a, b) => riskScore(b, db) - riskScore(a, db))[0]
  const lever = all.flatMap((p) => p.dep.map((d) => ({ src: db.upd[d], dst: p }))).filter((e) => e.src && health(e.src) < 45)
  const dupCases = all.filter((p) => anomalies(p, db.hist[p.id]).some((a) => a.label.startsWith('repeat')))
  const gapCases = all.filter((p) => p.phys - p.fin > 30)
  const systemic = db.tickets.filter((tk) => tk.st !== 'Closed' && tk.sla - db.day <= -7)

  const insights = []
  if (worst) insights.push({
    sev: 'red',
    t: `Top risk: ${worst.id} — ${worst.name}`,
    d: `Health ${health(worst)}, risk score ${riskScore(worst, db)}/100, ₹${costOfDelay(worst)}cr/week burning. Blocker: ${worst.blocker}. Recommended: open the Evidence AI Card and assign an owner with a 14-day SLA.`,
    act: () => openAI(worst.id), actLabel: 'Open AI Card',
  })
  lever.forEach((e) => insights.push({
    sev: 'amber',
    t: `Leverage: clear ${e.src.id} to unlock ${e.dst.id}`,
    d: `${e.src.id} (${e.src.name}) is critical at health ${health(e.src)} and is blocking ₹${e.dst.cost}cr downstream (${e.dst.id}). One approval here moves two projects.`,
    act: () => openAI(e.src.id), actLabel: 'Fix source',
  }))
  if (dupCases.length) insights.push({
    sev: 'amber',
    t: `Stall pattern detected: ${dupCases.map((p) => p.id).join(', ')}`,
    d: `Identical update text repeated across reporting cycles — classic sign of copy-paste reporting with no field progress. Send a verification notice.`,
    act: () => dupCases.forEach((p) => openAI(p.id)), actLabel: 'Review cards',
  })
  if (gapCases.length) insights.push({
    sev: 'red',
    t: `Billing anomaly: ${gapCases.map((p) => p.id).join(', ')}`,
    d: `Physical progress far outstrips financial spend (gap >30%) — likely billing lag or inflated claims. Cross-check MB books and invoices.`,
    act: null,
  })
  if (systemic.length) insights.push({
    sev: 'red',
    t: `Systemic delay: ${systemic.map((tk) => tk.id).join(', ')}`,
    d: `These interventions are 7+ days past SLA. Per the ladder, tag them in the repeat-delay registry and issue a DO-letter to the administrative secretary.`,
    act: null,
  })
  if (!insights.length) insights.push({ sev: 'green', t: 'Portfolio stable', d: 'No critical risks, levers or anomalies right now. Keep the live clock running to stress-test the SLA ladder.', act: null })

  const send = (q) => {
    const ans = (() => {
      const ql = q.toLowerCase()
      if (ql.includes('p-101')) return `P-101 (Bareilly–Moradabad 4-lane): health ${health(db.upd['P-101'])}, overdue ${db.upd['P-101'].over}d, ₹${costOfDelay(db.upd['P-101'])}cr/wk. Root cause: Forest Clearance Stage-II (P-118) pending 45d. Fastest fix: intervene on P-118, not P-101.`
      if (ql.includes('cost') || ql.includes('money') || ql.includes('risk')) { const tot = all.reduce((s, p) => s + costOfDelay(p), 0); return `Total cost-at-risk is ₹${Math.round(tot * 10) / 10}cr per week. Top 3 contributors: ${[...all].sort((a, b) => costOfDelay(b) - costOfDelay(a)).slice(0, 3).map((p) => `${p.id} ₹${costOfDelay(p)}cr/wk`).join(', ')}.` }
      if (ql.includes('ticket') || ql.includes('sla')) { const open = db.tickets.filter((x) => x.st !== 'Closed'); return `${open.length} open ticket(s). ${open.map((tk) => `${tk.id}: ${tk.sla - db.day}d left, escalated ×${tk.esc || 0}`).join(' · ') || 'None yet — approve an AI Card to start the clock.'}` }
      if (ql.includes('what') || ql.includes('do')) return `Next best action: ${worst ? `open the AI Card for ${worst.id} (highest composite risk ${riskScore(worst, db)}/100) and approve it — that starts a 14-day SLA with a named owner.` : 'nothing critical, keep monitoring.'}`
      return `Try asking about a project id (e.g. "P-101"), "cost at risk", "tickets", or "what should I do".`
    })()
    setMsgs((m) => [...(m || []), { me: true, txt: q }, { me: false, txt: ans }])
  }

  return (
    <>
      <div className="copdrawer noprint">
        <div className="cophead">
          <b>✦ SETU Copilot</b><span className="mut">rule-based · deterministic · synthetic</span>
          <button className="mclose" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="copbody">
          <div className="copnote">Press Alt+C anytime. Answers are generated from the live demo state — no ML, no external calls.</div>
          {insights.map((ins, i) => (
            <div key={i} className={`insight ${ins.sev}`}>
              <b>{ins.t}</b>
              <div>{ins.d}</div>
              {ins.act && <button className="btn b sm" onClick={ins.act}>{ins.actLabel}</button>}
            </div>
          ))}
          <div className="copqa">
            {(msgs || [{ me: false, txt: 'Ask me: "P-101", "cost at risk", "tickets", "what should I do".' }]).map((m, i) => (
              <div key={i} className={m.me ? 'q' : 'a'}>{m.txt}</div>
            ))}
          </div>
          <div className="copinput">
            <input placeholder="Ask the copilot…" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) { send(e.target.value.trim()); e.target.value = '' } }} />
          </div>
        </div>
      </div>
      <style>{`
        .copdrawer { position: fixed; right: 0; top: 0; bottom: 0; width: 380px; max-width: 92vw; background: var(--card); border-left: 1px solid var(--line); box-shadow: var(--sh-lg); z-index: 50; display: flex; flex-direction: column; animation: slidein .18s ease-out; }
        .cophead { display: flex; align-items: center; gap: 8px; padding: 14px 16px; border-bottom: 1px solid var(--line); font-size: 13.5px; }
        .cophead .mut { font-size: 10.5px; }
        .cophead .mclose { margin-left: auto; }
        .copbody { flex: 1; overflow-y: auto; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
        .copnote { font-size: 10.5px; color: var(--faint); background: var(--wash); border-radius: 8px; padding: 7px 10px; }
        .insight { border: 1px solid var(--line); border-radius: 11px; padding: 11px 13px; font-size: 12.5px; }
        .insight.red { background: var(--red-soft); border-color: #f6c8c8; }
        .insight.amber { background: var(--amber-soft); border-color: #f3e2c0; }
        .insight.green { background: var(--green-soft); border-color: #bbe7c9; }
        .insight b { display: block; margin-bottom: 4px; font-size: 12.5px; }
        .insight .btn { margin-top: 8px; }
        .copqa { display: flex; flex-direction: column; gap: 7px; margin-top: 4px; }
        .copqa .q { align-self: flex-end; background: var(--blue-soft); color: var(--blue); border-radius: 12px 12px 3px 12px; padding: 8px 12px; font-size: 12.5px; max-width: 85%; }
        .copqa .a { align-self: flex-start; background: var(--wash); border-radius: 12px 12px 12px 3px; padding: 8px 12px; font-size: 12.5px; max-width: 90%; line-height: 1.5; }
        .copinput { position: sticky; bottom: 0; background: var(--card); padding-top: 8px; }
        .copilotfab { position: fixed; right: 18px; bottom: 18px; z-index: 45; background: #101828; color: #fff; border: 0; border-radius: 24px; padding: 11px 18px; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: var(--sh-lg); }
        .copilotfab:hover { background: #1c2b4a; }
      `}</style>
    </>
  )
}
