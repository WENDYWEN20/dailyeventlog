import type { Goal } from '../../types/domain'

export const goals: Goal[] = [
  {
    id: 'goal-monthly-backend',
    userId: 'local-dev-user',
    title: 'Build the FastAPI backend foundation',
    timeframe: 'monthly',
    targetHours: 30,
    createdAt: '2026-08-01T12:00:00Z',
  },
  {
    id: 'goal-annual-ai',
    userId: 'local-dev-user',
    title: 'Ship an AI-assisted productivity portfolio app',
    timeframe: 'annual',
    targetHours: 250,
    createdAt: '2026-01-01T12:00:00Z',
  },
]
