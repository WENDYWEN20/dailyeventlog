from typing import Literal

from pydantic import BaseModel, ConfigDict

Timeframe = Literal["daily", "monthly", "annual", "5year"]


class GoalBase(BaseModel):
    title: str
    timeframe: Timeframe
    target_hours: int


class GoalCreate(GoalBase):
    pass


class GoalRead(GoalBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
