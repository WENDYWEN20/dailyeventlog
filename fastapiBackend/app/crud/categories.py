from app.schemas.category import CategoryCreate


def create_category_placeholder(category: CategoryCreate, user_id: str) -> dict[str, str]:
    return {"id": "placeholder", "user_id": user_id, **category.model_dump()}
