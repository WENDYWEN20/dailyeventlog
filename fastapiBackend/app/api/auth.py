from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
def read_current_user() -> dict[str, str]:
    return {"message": "Auth endpoint placeholder"}
