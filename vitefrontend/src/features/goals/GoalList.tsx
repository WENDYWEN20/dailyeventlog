import type { Goal } from '../../types/domain'

type GoalListProps = {
  goals: Goal[]
}

export function GoalList({ goals }: GoalListProps) {
  return (
    <ul className="goal-list">
      {goals.map((goal) => (
        <li className="goal-row" key={goal.id}>
          <div className="goal-title">{goal.title}</div>
          <div className="goal-meta">
            <span>{goal.timeframe}</span>
            <span>{goal.targetHours}h target</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
