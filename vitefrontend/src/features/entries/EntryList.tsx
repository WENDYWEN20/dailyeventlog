import type { Category, TimeEntry } from '../../types/domain'
import { formatDateTime, formatDuration } from '../../utils/time'

type EntryListProps = {
  categories: Category[]
  entries: TimeEntry[]
}

export function EntryList({ categories, entries }: EntryListProps) {
  if (entries.length === 0) {
    return <div className="empty-state">No entries yet.</div>
  }

  return (
    <ul className="entry-list">
      {entries.map((entry) => {
        const category = categories.find((item) => item.id === entry.categoryId)

        return (
          <li className="entry-row" key={entry.id}>
            <div className="entry-title">{entry.description}</div>
            <div className="entry-meta">
              <span>
                {category ? (
                  <span
                    className="category-dot"
                    style={{ backgroundColor: category.color }}
                  />
                ) : null}
                {category?.name ?? 'Uncategorized'}
              </span>
              <span>{formatDuration(entry.durationMinutes)}</span>
            </div>
            <div className="entry-meta">
              <span>{formatDateTime(entry.startedAt)}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
