import { useMemo, useState } from 'react'
import './App.css'
import { AppShell } from './components/AppShell'
import { categories } from './features/categories/mockCategories'
import { goals } from './features/goals/mockGoals'
import { timeEntries } from './features/entries/mockTimeEntries'
import { GoalsPage } from './pages/GoalsPage'
import { HistoryPage } from './pages/HistoryPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { TodayPage } from './pages/TodayPage'
import type { AppPage } from './types/navigation'

function App() {
  const [activePage, setActivePage] = useState<AppPage>('today')
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const pages: Record<AppPage, React.ReactNode> = {
    today: (
      <TodayPage
        categories={categories}
        entries={timeEntries}
        selectedDate={today}
      />
    ),
    history: <HistoryPage categories={categories} entries={timeEntries} />,
    reports: <ReportsPage categories={categories} entries={timeEntries} />,
    goals: <GoalsPage goals={goals} />,
    settings: <SettingsPage categories={categories} />,
  }

  return (
    <AppShell activePage={activePage} onPageChange={setActivePage}>
      {pages[activePage]}
    </AppShell>
  )
}

export default App
