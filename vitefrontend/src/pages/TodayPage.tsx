import { PageHeader } from '../components/PageHeader'
import { EntryForm } from '../features/entries/EntryForm'
import { EntryList } from '../features/entries/EntryList'
import { SummaryPanel } from '../features/reports/SummaryPanel'
import { useCategoryTotals } from '../hooks/useCategoryTotals'
import type { Category, TimeEntry } from '../types/domain'

type TodayPageProps = {
  categories: Category[]
  entries: TimeEntry[]
  selectedDate: string
}

export function TodayPage({ categories, entries, selectedDate }: TodayPageProps) {
  const todaysEntries = entries.filter((entry) =>
    entry.startedAt.startsWith(selectedDate),
  )
  const totals = useCategoryTotals(todaysEntries, categories)

  return (
    <>
      <PageHeader
        title="Today Log"
        description="Record focused work and review today's productive time."
        aside={<strong>{selectedDate}</strong>}
      />

      <div className="panel-grid">
        <section className="panel">
          <h3>Entries</h3>
          <EntryList categories={categories} entries={todaysEntries} />
        </section>

        <aside className="panel">
          <h3>New Entry</h3>
          <EntryForm categories={categories}  selectedDate={selectedDate}/>
        </aside>

        <section className="panel">
          <h3>Daily Summary</h3>
          <SummaryPanel totals={totals} />
        </section>
      </div>
    </>
  )
}
