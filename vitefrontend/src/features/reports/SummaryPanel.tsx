import type { CategoryTotal } from '../../types/domain'
import { formatDuration } from '../../utils/time'

type SummaryPanelProps = {
  totals: CategoryTotal[]
}

export function SummaryPanel({ totals }: SummaryPanelProps) {
  const totalMinutes = totals.reduce((sum, item) => sum + item.totalMinutes, 0)

  return (
    <div className="summary-stack">
      <div className="summary-row">
        <strong>Total productive time</strong>
        <strong>{formatDuration(totalMinutes)}</strong>
      </div>
      {totals.map((total) => (
        <div className="summary-row" key={total.categoryId}>
          <span>
            <span
              className="category-dot"
              style={{ backgroundColor: total.categoryColor }}
            />
            {total.categoryName}
          </span>
          <span>{formatDuration(total.totalMinutes)}</span>
        </div>
      ))}
    </div>
  )
}
