from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TimeEntryBase(BaseModel):
    category_id: str = Field(alias="categoryId")
    description: str = Field(min_length=1, max_length=500)
    started_at: datetime = Field(alias="startedAt")
    duration_minutes: int = Field(alias="durationMinutes", gt=0)

    model_config = ConfigDict(populate_by_name=True)


class TimeEntryCreate(TimeEntryBase):
    pass


class TimeEntryRead(TimeEntryBase):
    id: str
    created_at: datetime = Field(alias="createdAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
