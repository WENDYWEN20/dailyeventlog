def empty_daily_report(date: str) -> dict[str, object]:
    return {"date": date, "totalMinutes": 0, "byCategory": []}


def empty_monthly_report(month: str) -> dict[str, object]:
    return {"month": month, "totalMinutes": 0, "byCategory": [], "byDay": []}
