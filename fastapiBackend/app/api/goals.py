from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_goals() -> list[dict[str, str]]:
    return []
