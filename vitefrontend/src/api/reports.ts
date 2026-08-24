import { apiRequest } from './client'
import type { CategoryTotal } from '../types/domain'

export type DailyReport = {
  date: string
  totalMinutes: number
  byCategory: CategoryTotal[]
}

export type MonthlyReport = {
  month: string
  totalMinutes: number
  byCategory: CategoryTotal[]
  byDay: Array<{ date: string; totalMinutes: number }>
}

export function getDailyReport(date: string) {
  return apiRequest<DailyReport>(`/reports/daily?date=${date}`)
}

export function getMonthlyReport(month: string) {
  return apiRequest<MonthlyReport>(`/reports/monthly?month=${month}`)
}
