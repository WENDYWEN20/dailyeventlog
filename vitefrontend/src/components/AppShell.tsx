import type { AppPage, NavItem } from '../types/navigation'

const navItems: NavItem[] = [
  { id: 'today', label: 'Today' },
  { id: 'history', label: 'History' },
  { id: 'reports', label: 'Reports' },
  { id: 'goals', label: 'Goals' },
  { id: 'settings', label: 'Settings' },
]

type AppShellProps = {
  activePage: AppPage
  children: React.ReactNode
  onPageChange: (page: AppPage) => void
}

export function AppShell({ activePage, children, onPageChange }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>Daily Event Log</h1>
          <p>Plan, record, account, review.</p>
        </div>

        <nav aria-label="Primary navigation">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`nav-button ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => onPageChange(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="content">{children}</main>
    </div>
  )
}
