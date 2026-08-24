from fastapi import Depends

from app.schemas.user import UserRead


def get_current_user() -> UserRead:
    return UserRead(id="local-dev-user", email="dev@example.com")


CurrentUser = Depends(get_current_user)
