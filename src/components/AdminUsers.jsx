import { useStore } from '../lib/useStore.js'
import { t } from '../lib/i18nToggle.js'
import { toggleUser, toast } from '../lib/store.js'

const ROLECLS = { Secretary: 'p-blu', 'Review Officer': 'p-pur', 'Project Officer': 'p-grn', Admin: 'p-yel' }

export default function AdminUsers() {
  const db = useStore()
  return (
    <div className="panel card">
      <div className="phead"><div><div className="pt">{t('h_users')}</div><div className="ps">Mock RBAC — passwords are demo credentials, disable blocks sign-in instantly</div></div></div>
      <div className="pbody">
        <table>
          <thead><tr><th>User</th><th>Username</th><th>Role</th><th>Failed logins</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {db.users.map((u) => {
              const self = db.session && db.session.u === u.u
              return (
                <tr key={u.u}>
                  <td><b>{u.n}</b>{self ? <span className="pill p-blu" style={{ marginLeft: 6 }}>you</span> : null}</td>
                  <td className="mono">{u.u}</td>
                  <td><span className={`pill ${ROLECLS[u.r] || 'p-gry'}`}>{u.r}</span></td>
                  <td>{db.fails[u.u] || 0}{(db.fails[u.u] || 0) >= 3 ? ' ⚠' : ''}</td>
                  <td>{u.ok ? <span className="pill p-grn">active</span> : <span className="pill p-gry">disabled</span>}</td>
                  <td>
                    <button className="btn o sm" disabled={self} onClick={() => { toggleUser(u.u); toast(`${u.u} ${u.ok ? 'disabled' : 'enabled'}`, u.ok ? 'warn' : 'ok') }}>
                      {u.ok ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
