from fastapi import APIRouter

router = APIRouter()


@router.get("/daily")
def read_daily_report(date: str) -> dict[str, object]:
    return {"date": date, "totalMinutes": 0, "byCategory": []}


@router.get("/monthly")
def read_monthly_report(month: str) -> dict[str, object]:
    return {"month": month, "totalMinutes": 0, "byCategory": [], "byDay": []}
