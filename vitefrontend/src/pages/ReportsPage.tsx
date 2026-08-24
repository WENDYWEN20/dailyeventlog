import { PageHeader } from '../components/PageHeader'
import { SummaryPanel } from '../features/reports/SummaryPanel'
import { useCategoryTotals } from '../hooks/useCategoryTotals'
import type { Category, TimeEntry } from '../types/domain'

type ReportsPageProps = {
  categories: Category[]
  entries: TimeEntry[]
}

export function ReportsPage({ categories, entries }: ReportsPageProps) {
  const totals = useCategoryTotals(entries, categories)

  return (
    <>
      <PageHeader
        title="Reports"
        description="Backend report endpoints will aggregate time by day, month, and category."
      />

      <section className="panel">
        <h3>Current Mock Summary</h3>
        <SummaryPanel totals={totals} />
      </section>
    </>
  )
}
