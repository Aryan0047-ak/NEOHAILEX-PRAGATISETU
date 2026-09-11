import { useStore } from './lib/useStore.js'
import Login from './components/Login.jsx'
import Shell from './components/Shell.jsx'
import Copilot from './components/Copilot.jsx'

// Error boundary so one broken screen never blanks the whole app in a demo.
import React from 'react'
class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null } }
  static getDerivedStateFromError(err) { return { err } }
  render() {
    if (this.state.err) return (
      <div className="bnd">
        <div style={{ fontSize: 30 }}>🛠</div>
        <div className="bt">Something broke — the demo survives</div>
        <div className="mut" style={{ marginBottom: 10 }}>Reset demo data from the sidebar, or reload. Error:</div>
        <pre>{String(this.state.err && this.state.err.message || this.state.err)}</pre>
        <button className="btn b" onClick={() => { localStorage.removeItem('setu'); location.reload() }}>Reset demo + reload</button>
      </div>
    )
    return this.props.children
  }
}

export default function App() {
  const db = useStore()
  return (
    <Boundary>
      {db.session ? (
        <>
          <Shell />
          <Copilot />
        </>
      ) : (
        <Login />
      )}
    </Boundary>
  )
}
