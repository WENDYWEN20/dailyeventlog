from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Daily Event Log API is running"}


def test_create_time_entry_accepts_frontend_payload() -> None:
    response = client.post(
        "/time-entries",
        json={
            "categoryId": "cat-deep-work",
            "description": "Study FastAPI routes",
            "startedAt": "2026-08-23T14:30:00Z",
            "durationMinutes": 60,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["categoryId"] == "cat-deep-work"
    assert body["description"] == "Study FastAPI routes"
    assert body["durationMinutes"] == 60
    assert "id" in body
    assert "createdAt" in body
