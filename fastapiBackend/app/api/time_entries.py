from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter

from app.schemas.time_entry import TimeEntryCreate, TimeEntryRead

router = APIRouter()


@router.get("")
def list_time_entries() -> list[dict[str, str]]:
    return []


@router.post("", response_model=TimeEntryRead)
def create_time_entry(entry: TimeEntryCreate) -> TimeEntryRead:
    return TimeEntryRead(
        id=str(uuid4()),
        category_id=entry.category_id,
        description=entry.description,
        started_at=entry.started_at,
        duration_minutes=entry.duration_minutes,
        created_at=datetime.now(timezone.utc),
    )
