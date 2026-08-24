import type { Category, CategoryTotal, TimeEntry } from '../types/domain'

export function useCategoryTotals(
  entries: TimeEntry[],
  categories: Category[],
): CategoryTotal[] {
  return categories
    .map((category) => {
      const totalMinutes = entries
        .filter((entry) => entry.categoryId === category.id)
        .reduce((sum, entry) => sum + entry.durationMinutes, 0)

      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        totalMinutes,
      }
    })
    .filter((total) => total.totalMinutes > 0)
}
