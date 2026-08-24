import { apiRequest } from './client'
import type { CreateTimeEntryInput, TimeEntry } from '../types/domain'

export type TimeEntryFilters = {
  from?: string
  to?: string
  categoryId?: string
}

export function listTimeEntries(filters: TimeEntryFilters = {}) {
  const params = new URLSearchParams()

  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.categoryId) params.set('categoryId', filters.categoryId)

  const query = params.toString()

  return apiRequest<TimeEntry[]>(`/time-entries${query ? `?${query}` : ''}`)
}

export function createTimeEntry(payload: CreateTimeEntryInput) {
  return apiRequest<TimeEntry>('/time-entries', {
    method: 'POST',
    body: payload,
  })
}
