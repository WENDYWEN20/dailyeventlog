import { PageHeader } from '../components/PageHeader'
import { GoalList } from '../features/goals/GoalList'
import type { Goal } from '../types/domain'

type GoalsPageProps = {
  goals: Goal[]
}

export function GoalsPage({ goals }: GoalsPageProps) {
  return (
    <>
      <PageHeader
        title="Goals"
        description="Track monthly, annual, and 5-year goals against logged time."
      />

      <section className="panel">
        <h3>Active Goals</h3>
        <GoalList goals={goals} />
      </section>
    </>
  )
}
