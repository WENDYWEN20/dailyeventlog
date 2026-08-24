export type Category = {
  id: string
  userId: string
  name: string
  color: string
}

export type TimeEntry = {
  id: string
  userId: string
  categoryId: string
  description: string
  startedAt: string
  durationMinutes: number
  createdAt: string
}

export type Goal = {
  id: string
  userId: string
  title: string
  timeframe: 'daily' | 'monthly' | 'annual' | '5year'
  targetHours: number
  createdAt: string
}

export type CreateTimeEntryInput = {
  categoryId: string
  description: string
  startedAt: string
  durationMinutes: number
}

export type CategoryTotal = {
  categoryId: string
  categoryName: string
  categoryColor: string
  totalMinutes: number
}
