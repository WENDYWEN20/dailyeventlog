import type { TimeEntry } from '../../types/domain'

export const timeEntries: TimeEntry[] = [
  {
    id: 'entry-1',
    userId: 'local-dev-user',
    categoryId: 'cat-deep-work',
    description: 'Backend folder structure and FastAPI scaffold',
    startedAt: '2026-08-22T09:00:00Z',
    durationMinutes: 120,
    createdAt: '2026-08-22T11:05:00Z',
  },
  {
    id: 'entry-2',
    userId: 'local-dev-user',
    categoryId: 'cat-learning',
    description: 'Studied frontend data flow and API contracts',
    startedAt: '2026-08-22T13:00:00Z',
    durationMinutes: 90,
    createdAt: '2026-08-22T14:40:00Z',
  },
  {
    id: 'entry-3',
    userId: 'local-dev-user',
    categoryId: 'cat-admin',
    description: 'Project README cleanup',
    startedAt: '2026-08-21T18:00:00Z',
    durationMinutes: 35,
    createdAt: '2026-08-21T18:45:00Z',
  },
]
