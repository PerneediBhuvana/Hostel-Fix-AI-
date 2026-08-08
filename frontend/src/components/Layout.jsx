import { NavLink, useNavigate } from 'react-router-dom'

export default function Layout({ user, children, darkMode, setDarkMode, onLogout }) {
  const navigate = useNavigate()
  const role = user?.role?.toLowerCase()

  const links = role === 'admin'
    ? [
        ['/dashboard', 'Dashboard', '▦'],
        ['/complaints', 'All Complaints', '≡'],
        ['/students', 'Students', '♙'],
        ['/staff', 'Faculty & Staff', '⚙'],
        ['/reports', 'Reports & Analytics', '◒']
      ]
    : role === 'faculty'
    ? [
        ['/dashboard', 'Dashboard', '▦'],
        ['/floor-complaints', 'Floor Complaints', '≡'],
        ['/profile', 'Profile', '♙']
      ]
    : role === 'warden'
    ? [
        ['/dashboard', 'Dashboard', '▦'],
        ['/warden-complaints', 'Block Complaints', '≡'],
        ['/profile', 'Profile', '♙']
      ]
    : role === 'staff'
    ? [
        ['/dashboard', 'Dashboard', '▦'],
        ['/assigned', 'Assigned Tasks', '≡'],
        ['/profile', 'Profile', '♙']
      ]
    : [
        ['/dashboard', 'Dashboard', '▦'],
        ['/complaints/new', 'Raise Complaint', '＋'],
        ['/complaints', 'Complaint History', '≡'],
        ['/profile', 'Profile', '♙']
      ]

  const handleSignOut = () => {
    localStorage.removeItem('hostelfix_token')
    localStorage.removeItem('hostelfix_user')
    localStorage.removeItem('haven_token')
    localStorage.removeItem('haven_user')
    if (onLogout) onLogout()
    navigate('/')
  }

  const roleTitle = role === 'admin'
    ? 'Admin Console'
    : role === 'faculty'
    ? 'Floor Coordinator (Faculty)'
    : role === 'warden'
    ? 'Hostel Warden Console'
    : role === 'staff'
    ? 'Maintenance Desk'
    : 'Resident Student Portal'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">HF</div>
          <span>HOSTELFIX AI</span>
        </div>
        <nav>
          {links.map(([to, label, icon]) => (
            <NavLink key={to} to={to} className="nav-link">
              <b>{icon}</b>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <button className="nav-link w-100 border-0 bg-transparent" onClick={() => setDarkMode(!darkMode)}>
            <b>{darkMode ? '☼' : '◐'}</b>
            <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button className="nav-link w-100 border-0 bg-transparent" onClick={handleSignOut}>
            <b>↪</b>
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">{roleTitle}</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <strong className="d-block small">{user?.name}</strong>
              <span className="text-secondary small text-capitalize">{user?.role}</span>
            </div>
            <div className="brand-mark">{user?.name?.[0] || 'U'}</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}

