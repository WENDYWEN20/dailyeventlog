from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, categories, goals, reports, time_entries
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Daily Event Log API",
        description="Shared API for the Daily Event Log web and iOS clients.",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(categories.router, prefix="/categories", tags=["categories"])
    app.include_router(time_entries.router, prefix="/time-entries", tags=["time entries"])
    app.include_router(goals.router, prefix="/goals", tags=["goals"])
    app.include_router(reports.router, prefix="/reports", tags=["reports"])

    @app.get("/")
    def read_root() -> dict[str, str]:
        return {"message": "Daily Event Log API is running"}

    @app.get("/health")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
