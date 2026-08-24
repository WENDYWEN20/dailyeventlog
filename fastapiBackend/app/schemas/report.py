from pydantic import BaseModel


class CategoryTotal(BaseModel):
    category_id: str
    category_name: str
    category_color: str
    total_minutes: int


class DailyReport(BaseModel):
    date: str
    total_minutes: int
    by_category: list[CategoryTotal]


class MonthlyReport(BaseModel):
    month: str
    total_minutes: int
    by_category: list[CategoryTotal]
    by_day: list[dict[str, object]]
