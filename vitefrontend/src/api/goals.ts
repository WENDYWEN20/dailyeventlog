import { apiRequest } from './client'
import type { Goal } from '../types/domain'

export function listGoals() {
  return apiRequest<Goal[]>('/goals')
}
