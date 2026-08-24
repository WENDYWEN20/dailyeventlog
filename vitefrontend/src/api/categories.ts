import { apiRequest } from './client'
import type { Category } from '../types/domain'

export function listCategories() {
  return apiRequest<Category[]>('/categories')
}
