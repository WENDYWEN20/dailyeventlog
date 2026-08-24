from app.schemas.goal import GoalCreate


def create_goal_placeholder(goal: GoalCreate, user_id: str) -> dict[str, object]:
    return {"id": "placeholder", "user_id": user_id, **goal.model_dump()}
