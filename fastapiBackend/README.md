# Daily Event Log Backend

This directory is for the FastAPI backend for **Daily Event Log**. The backend is the shared API layer for the React web frontend and the future React Native iOS app. It owns authentication, validation, business rules, database access, and report aggregation.

## Backend Role in the System

The backend sits between all clients and the database:

```text
React Web Frontend ----\
                       ----> FastAPI Backend ----> PostgreSQL
React Native iOS  -----/
```

The backend is responsible for:

- Exposing HTTP endpoints for auth, categories, time entries, goals, and reports.
- Validating request bodies with Pydantic schemas.
- Authenticating users with JWT tokens.
- Enforcing authorization so users can only access their own records.
- Translating API requests into SQLAlchemy database operations.
- Running time-based aggregations for daily and monthly reports.
- Returning stable response DTOs that frontend clients can type against.

The backend is the source of truth for business data. Frontend clients can cache responses, but persisted data lives in PostgreSQL and must be read or changed through the API.

## Target Stack

- FastAPI
- Python 3.11+
- PostgreSQL
- SQLAlchemy async ORM
- Alembic migrations
- Pydantic request and response schemas
- JWT authentication, eventually issued by Amazon Cognito in the AWS deployment

## Backend Design as a System Design Answer

At a system design level, the backend can be explained as five layers:

```text
API Routes
  -> Pydantic Schemas
  -> Service / CRUD Layer
  -> SQLAlchemy Models
  -> PostgreSQL
```

### 1. API Routes

Routes define the HTTP contract used by the frontend and iOS clients. They should stay thin:

- Parse path/query/body parameters.
- Require the authenticated current user.
- Call service or CRUD functions.
- Return response schemas.

Expected route groups:

```text
app/api/
  auth.py
  categories.py
  time_entries.py
  goals.py
  reports.py
```

### 2. Pydantic Schemas

Schemas define the API shape, separate from database models:

```text
app/schemas/
  user.py
  category.py
  time_entry.py
  goal.py
  report.py
```

Use separate schemas for create, update, and response objects. For example:

```python
class TimeEntryCreate(BaseModel):
    category_id: UUID
    description: str
    started_at: datetime
    duration_minutes: int


class TimeEntryRead(BaseModel):
    id: UUID
    category_id: UUID
    description: str
    started_at: datetime
    duration_minutes: int
    created_at: datetime
```

The frontend should send only user-controlled fields. The backend derives `user_id` from the JWT token instead of trusting the client to send it.

### 3. Service / CRUD Layer

The service or CRUD layer contains reusable database operations and business rules:

```text
app/crud/
  categories.py
  time_entries.py
  goals.py
  reports.py
```

Examples:

- Create a time entry for the authenticated user.
- List entries between two dates.
- Update an entry only if it belongs to the current user.
- Delete a category only if it belongs to the current user.
- Aggregate daily/monthly totals with SQL `GROUP BY`.

Keeping this logic outside route handlers makes it easier to test and reuse.

### 4. SQLAlchemy Models

Models represent the database tables and relationships:

```text
app/models/
  user.py
  category.py
  time_entry.py
  goal.py
```

The models should match the PostgreSQL schema and enforce relationships through foreign keys.

### 5. Core Infrastructure

Shared backend infrastructure belongs in `app/core/`:

```text
app/core/
  config.py       # environment variables and settings
  database.py     # async SQLAlchemy engine and session dependency
  auth.py         # JWT validation and current-user dependency
```

This keeps route files focused on API behavior instead of setup code.

## Planned Project Structure

```text
fastapiBackend/
  app/
    main.py              # FastAPI app creation and router registration
    api/
      auth.py
      categories.py
      time_entries.py
      goals.py
      reports.py
    core/
      auth.py
      config.py
      database.py
    crud/
      categories.py
      time_entries.py
      goals.py
      reports.py
    models/
      user.py
      category.py
      time_entry.py
      goal.py
    schemas/
      user.py
      category.py
      time_entry.py
      goal.py
      report.py
  alembic/
  requirements.txt
```

## Data Schema Design

The app data is relational and structured. PostgreSQL is a good fit because the core product depends on ownership checks, foreign-key relationships, and time-based aggregation.

```text
users
  id
  email
  hashed_password
  created_at

categories
  id
  user_id
  name
  color

time_entries
  id
  user_id
  category_id
  description
  started_at
  duration_minutes
  created_at

goals
  id
  user_id
  title
  timeframe        # daily | monthly | annual | 5year
  target_hours
  created_at
```

### Relationships

```text
users.id -> categories.user_id
users.id -> time_entries.user_id
users.id -> goals.user_id
categories.id -> time_entries.category_id
```

Each user owns categories, time entries, and goals. Time entries point to categories so reports can group productive time by activity type.

### Why This Schema Works

- `users` is the root ownership table.
- `categories` are per-user because every person may track work differently.
- `time_entries` stores the atomic log events: what happened, when it started, and how long it took.
- `goals` stores planning targets across daily, monthly, annual, and 5-year horizons.
- `started_at` makes date-range filtering straightforward.
- `duration_minutes` makes reports efficient because SQL can use `SUM(duration_minutes)`.
- Foreign keys preserve integrity so entries cannot point at missing users or categories.

### Suggested Constraints and Indexes

Useful constraints:

```text
users.email UNIQUE NOT NULL
categories.user_id NOT NULL
categories.name NOT NULL
time_entries.user_id NOT NULL
time_entries.category_id NOT NULL
time_entries.duration_minutes > 0
goals.timeframe IN ('daily', 'monthly', 'annual', '5year')
```

Useful indexes:

```text
time_entries(user_id, started_at)
time_entries(user_id, category_id)
categories(user_id)
goals(user_id, timeframe)
```

The most important index is `time_entries(user_id, started_at)` because daily and monthly reports filter by authenticated user and date range.

## Data Flow

### Creating a Time Entry

```text
Frontend form submit
  -> POST /time-entries
  -> FastAPI route receives JSON payload
  -> Auth dependency validates JWT and loads current user
  -> Pydantic validates category_id, description, started_at, duration_minutes
  -> CRUD layer confirms the category belongs to the current user
  -> SQLAlchemy inserts time_entries row with server-derived user_id
  -> PostgreSQL commits transaction
  -> Backend returns TimeEntryRead response
  -> Frontend invalidates entry and report caches
```

The key backend rule is that `user_id` comes from auth, not from the frontend request body. This prevents one user from creating records under another user's account.

### Loading Entries for a Date Range

```text
Frontend opens history page
  -> GET /time-entries?from=YYYY-MM-DD&to=YYYY-MM-DD
  -> Backend validates query params and current user
  -> SQLAlchemy queries time_entries where user_id = current_user.id
  -> Query filters started_at by date range
  -> Backend returns list of entries
  -> Frontend renders history table or timeline
```

Filtering by `user_id` must be included in every query that reads user-owned data.

### Loading the Daily Summary

```text
Frontend opens daily summary
  -> GET /reports/daily?date=YYYY-MM-DD
  -> Backend computes date range for that day
  -> SQL groups entries by category for current user
  -> SQL sums duration_minutes
  -> Backend returns total minutes and category breakdown
  -> Frontend renders totals, category rows, and charts
```

Example aggregation shape:

```sql
SELECT
  categories.id,
  categories.name,
  categories.color,
  SUM(time_entries.duration_minutes) AS total_minutes
FROM time_entries
JOIN categories ON categories.id = time_entries.category_id
WHERE time_entries.user_id = :user_id
  AND time_entries.started_at >= :day_start
  AND time_entries.started_at < :day_end
GROUP BY categories.id, categories.name, categories.color;
```

The backend/database should do this aggregation instead of making the frontend fetch all entries and sum them in the browser.

### Loading the Monthly Report

```text
Frontend selects a month
  -> GET /reports/monthly?month=YYYY-MM
  -> Backend computes month start and month end
  -> SQL groups entries by day and category
  -> Backend returns report DTO
  -> Frontend renders monthly accounting and review views
```

Monthly reports can return both high-level totals and grouped rows:

```text
{
  month: "2026-08",
  totalMinutes: 4200,
  byCategory: [...],
  byDay: [...]
}
```

## Expected API Surface

```text
Auth
  POST /auth/register
  POST /auth/login
  GET  /auth/me

Categories
  GET    /categories
  POST   /categories
  PATCH  /categories/{id}
  DELETE /categories/{id}

Time Entries
  GET    /time-entries?from=YYYY-MM-DD&to=YYYY-MM-DD&categoryId=...
  POST   /time-entries
  PATCH  /time-entries/{id}
  DELETE /time-entries/{id}

Goals
  GET    /goals
  POST   /goals
  PATCH  /goals/{id}
  DELETE /goals/{id}

Reports
  GET /reports/daily?date=YYYY-MM-DD
  GET /reports/monthly?month=YYYY-MM
```

## API DTO Design

The backend should expose frontend-friendly response objects while keeping database-only fields private when they are not needed.

Example create request:

```json
{
  "categoryId": "5a02c655-4b87-4f47-8844-e1b1a4a79bb7",
  "description": "Deep Work - Algorithm Design",
  "startedAt": "2026-08-22T09:00:00Z",
  "durationMinutes": 150
}
```

Example response:

```json
{
  "id": "80735a06-22a6-426f-9f21-d0ba1813644d",
  "categoryId": "5a02c655-4b87-4f47-8844-e1b1a4a79bb7",
  "description": "Deep Work - Algorithm Design",
  "startedAt": "2026-08-22T09:00:00Z",
  "durationMinutes": 150,
  "createdAt": "2026-08-22T11:35:00Z"
}
```

The API can use camelCase JSON for frontend ergonomics while mapping to snake_case Python and database fields internally.

## Authentication and Authorization

Planned auth uses JWT tokens:

```text
Client sends Authorization: Bearer <token>
  -> Backend validates token
  -> Backend identifies current user
  -> Backend scopes every database query by current_user.id
```

Important authorization rules:

- Users can only read their own categories, entries, goals, and reports.
- Users can only create entries against categories they own.
- Users can only update or delete records they own.
- The frontend should never be trusted as the source of `user_id`.

## Error Handling

The backend should return predictable HTTP errors:

```text
400 Bad Request      invalid date range or malformed request
401 Unauthorized     missing or invalid token
403 Forbidden        authenticated user does not own the record
404 Not Found        record does not exist or is not visible to user
422 Unprocessable    Pydantic validation error
500 Server Error     unexpected backend failure
```

For security, `404` can be used instead of `403` when hiding the existence of another user's record is preferable.

## Local Development

Install or sync dependencies:

```bash
cd fastapiBackend
uv sync
```

Start the backend:

```bash
cd fastapiBackend
uv run uvicorn app.main:app --reload
```

Then open:

```text
http://127.0.0.1:8000
http://127.0.0.1:8000/docs
```

Run tests:

```bash
cd fastapiBackend
uv run pytest
```

### About `main.py`

The preferred app entrypoint is:

```text
fastapiBackend/app/main.py
```

That is why the normal start command is:

```bash
uv run uvicorn app.main:app --reload
```

This means:

```text
app.main  -> import app/main.py
:app      -> use the FastAPI variable named app
```

There is also a root compatibility file:

```text
fastapiBackend/main.py
```

It only contains:

```python
from app.main import app
```

This lets the older command still work:

```bash
cd fastapiBackend
uv run uvicorn main:app --reload
```

You can keep this root `main.py` as a convenience, or remove it later. If you remove it, start the app with `uv run uvicorn app.main:app --reload`.

### Generated and Placeholder Files

`.gitkeep` is an empty placeholder file used to make Git track an otherwise empty folder. Git does not commit empty directories by themselves. Once the folder has real files, `.gitkeep` is no longer needed and can be removed.

`__pycache__/` folders are generated automatically by Python when it imports files. They contain compiled bytecode cache files that make future imports faster. They should not be committed. This repo's backend `.gitignore` excludes them.

With Docker Compose from the repo root:

```bash
docker-compose up -d db
```

The local frontend should call the backend through an environment variable such as:

```text
VITE_API_BASE_URL=http://localhost:8000
```

## Deployment Model

In the planned AWS architecture:

```text
FastAPI Docker image
  -> pushed to ECR
  -> deployed on ECS Fargate
  -> connects to RDS PostgreSQL
  -> validates JWT tokens from Amazon Cognito
```

The React web app is served separately from S3 + CloudFront, and the iOS app is distributed through the App Store. Both clients call the same deployed FastAPI backend.

## Agents to add
Daily Reflection Agent: summarizes the user’s day from time entries and asks one useful review question.
Planning Agent: suggests tomorrow’s plan based on goals, unfinished work, and recent time patterns.
Time Audit Agent: detects mismatches between goals and actual time allocation.
Goal Coach Agent: breaks annual/monthly goals into realistic weekly targets.
Natural Language Logging Agent: lets users type “studied FastAPI for 90 minutes this morning” and converts it into a structured time entry.
Analytics Insight Agent: explains trends like “your deep work is highest on Tuesday mornings.”
RAG Productivity Agent: retrieves past logs and answers questions like “How much time did I spend learning backend development last month?”
