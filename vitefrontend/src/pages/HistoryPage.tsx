import { PageHeader } from '../components/PageHeader'
import { EntryList } from '../features/entries/EntryList'
import type { Category, TimeEntry } from '../types/domain'

type HistoryPageProps = {
  categories: Category[]
  entries: TimeEntry[]
}

export function HistoryPage({ categories, entries }: HistoryPageProps) {
  return (
    <>
      <PageHeader
        title="Entry History"
        description="Browse past logs by date range, category, and project."
      />

      <section className="panel">
        <h3>Recent Entries</h3>
        <EntryList categories={categories} entries={entries} />
      </section>
    </>
  )
}
