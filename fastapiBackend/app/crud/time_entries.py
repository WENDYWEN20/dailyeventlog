from app.schemas.time_entry import TimeEntryCreate


def create_time_entry_placeholder(entry: TimeEntryCreate, user_id: str) -> dict[str, object]:
    return {"id": "placeholder", "user_id": user_id, **entry.model_dump()}
