# Daily Event Log Frontend

This is the React + TypeScript web client for **Daily Event Log**, a personal time-tracking app based on the Lyubishchev method: plan your work, record focused time honestly, and review the data over daily, monthly, and yearly windows.

The frontend is currently scaffolded with Vite and React Compiler. The product architecture described below follows the root [README](../README.md) and is the target design for the web client as the backend and database are built out.

## Frontend Role in the System

The web app is one client in a shared multi-client system:

```text
React Web App  ----\
                  ----> FastAPI Backend ----> PostgreSQL
React Native iOS -/
```

The frontend is responsible for the user experience and client-side workflow:

- Render time-entry, category, goal, dashboard, and report screens.
- Collect user input for productive work logs: description, category, start time, duration, and related goal context.
- Call the FastAPI backend through typed API client functions.
- Cache server state for responsive screens and refetch when records change.
- Keep validation close to the user for fast feedback, while treating the backend as the source of truth.
- Share API-facing TypeScript types with the future iOS client where possible.

The frontend should not own durable business data. It can hold temporary form state, UI state, and cached API responses, but persisted records live in PostgreSQL behind the backend API.

## Current Stack

- React 19
- TypeScript
- Vite
- React Compiler through `@vitejs/plugin-react` and `babel-plugin-react-compiler`
- ESLint

Planned additions from the root architecture:

- React Query for server-state fetching, caching, invalidation, and mutation handling.
- Tailwind CSS / shadcn/ui for application UI components.
- Shared API types that can also be reused by the React Native iOS app.

## Frontend Design as a System Design Answer

At a system design level, the frontend can be explained as four layers:

```text
Pages / Routes
  -> Feature Components
  -> Hooks and API Client
  -> Backend HTTP API
```

### 1. Pages / Routes

Pages represent user workflows rather than database tables. Expected pages include:

- **Today Log**: create and review entries for the current day.
- **Entry History**: browse and filter past entries by date, category, or project.
- **Daily Summary**: total productive minutes per day and category breakdown.
- **Monthly Report**: grouped totals for accounting and review.
- **Goals**: monthly, annual, and 5-year goals with progress from logged time.
- **Settings / Categories**: user-owned category names and colors.

### 2. Feature Components

Components should be organized around product features:

```text
src/
  api/              # HTTP client functions and API types
  components/       # Shared UI primitives
  features/
    entries/        # Entry form, list, filters, mutations
    categories/     # Category picker and category settings
    goals/          # Goal list, goal form, progress views
    reports/        # Daily/monthly aggregation views
  hooks/            # Shared hooks for auth, dates, query helpers
  pages/            # Route-level screens
```

This keeps each feature close to the API calls, UI state, and domain types it owns.

### 3. Hooks and API Client

The API client should be a thin typed wrapper around backend endpoints. React Query hooks can sit on top of that wrapper:

```text
api/timeEntries.ts
  createTimeEntry(payload)
  listTimeEntries(filters)
  updateTimeEntry(id, payload)
  deleteTimeEntry(id)

features/entries/useTimeEntries.ts
  useTimeEntries(filters)
  useCreateTimeEntry()
  useUpdateTimeEntry()
  useDeleteTimeEntry()
```

The client should use environment configuration for the backend URL, for example `VITE_API_BASE_URL`.

### 4. Backend Contract

The backend exposes business operations over HTTP. The frontend should talk in API DTOs, not database implementation details. For example, the frontend sends `categoryId` and `durationMinutes`; the backend decides how to validate ownership, store rows, and compute reports.

## Data Schema Design

The core PostgreSQL schema is relational because the app needs reliable ownership rules and time-based aggregations.

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

### Why This Schema Works

- `users` owns all private application data.
- `categories.user_id` lets each user define their own category system.
- `time_entries.user_id` makes user filtering and authorization direct.
- `time_entries.category_id` enables category breakdowns without duplicating category names on every log.
- `started_at` supports daily, weekly, monthly, and yearly grouping.
- `duration_minutes` keeps aggregation simple with SQL `SUM(duration_minutes)`.
- `goals.timeframe` supports the Lyubishchev planning model across short and long horizons.

### Frontend Type Shape

The frontend should mirror backend response schemas with TypeScript types:

```ts
export type Category = {
  id: string
  userId: string
  name: string
  color: string
}

export type TimeEntry = {
  id: string
  userId: string
  categoryId: string
  description: string
  startedAt: string
  durationMinutes: number
  createdAt: string
}

export type Goal = {
  id: string
  userId: string
  title: string
  timeframe: 'daily' | 'monthly' | 'annual' | '5year'
  targetHours: number
  createdAt: string
}
```

For create/update forms, use narrower payload types so the frontend does not send server-owned fields:

```ts
export type CreateTimeEntryInput = {
  categoryId: string
  description: string
  startedAt: string
  durationMinutes: number
}
```

## Data Flow

### Creating a Time Entry

```text
User fills entry form
  -> React component stores draft form state
  -> Client validates required fields and duration format
  -> useCreateTimeEntry mutation calls POST /time-entries
  -> FastAPI validates JWT and request schema
  -> Backend writes row to PostgreSQL
  -> API returns created TimeEntry
  -> React Query updates or invalidates entry and summary caches
  -> UI shows the new entry and refreshed totals
```

The database is the source of truth. The frontend can optimistically update the UI later, but the safe first implementation should wait for the backend response before changing durable views.

### Loading the Daily Summary

```text
Daily Summary page loads
  -> useDailySummary(date) calls GET /reports/daily?date=YYYY-MM-DD
  -> FastAPI queries PostgreSQL for the current user's entries on that date
  -> SQL groups by category and sums duration_minutes
  -> API returns totals and category breakdowns
  -> Frontend renders total productive time and per-category rows/charts
```

The aggregation should happen on the backend/database side, not by fetching every historical entry into the browser and computing totals there. That keeps the frontend fast and protects data boundaries as the dataset grows.

### Monthly Reporting

```text
Monthly Report page chooses month
  -> GET /reports/monthly?month=YYYY-MM
  -> Backend filters by user and date range
  -> PostgreSQL groups entries by day and category
  -> API returns report DTO
  -> Frontend renders trend chart, totals, and review table
```

## Expected API Surface

Initial endpoint design can be:

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

## State Management Strategy

Use two categories of state:

- **Server state**: users, categories, time entries, goals, reports. Manage with React Query because this data comes from the backend, can become stale, and needs cache invalidation.
- **UI state**: open modals, selected date, filters, form drafts, active tabs. Manage locally with React state or small feature-level hooks.

Redux is only worth adding if the app later develops complex global client-only state. For the first version, React Query plus local React state is simpler and fits the data flow.

## Frontend Validation

The frontend should validate for user experience:

- Required description/category/date/duration fields.
- Positive duration in minutes.
- Reasonable date and time input format.
- Clear inline errors before submitting.

The backend must repeat critical validation because clients cannot be trusted. Frontend validation is for speed and clarity; backend validation is for correctness and security.

## Authentication Flow

Planned auth uses JWT tokens, eventually issued by Amazon Cognito in the AWS deployment.

```text
User logs in
  -> Frontend receives token
  -> API client attaches Authorization: Bearer <token>
  -> Backend validates token on protected routes
  -> Backend scopes every query by user_id
```

The frontend should never send `userId` as an authority for writes. The backend should derive the user from the token and attach `user_id` server-side.

## Local Development

```bash
npm install
npm run dev
```

Other useful commands:

```bash
npm run build
npm run lint
npm run preview
```

The current app entry points are:

- `src/main.tsx`: mounts React into the DOM.
- `src/App.tsx`: current scaffold UI.
- `src/App.css` and `src/index.css`: current global and component styles.
- `vite.config.ts`: Vite config with React Compiler enabled.

## Deployment Model

The frontend builds into static files:

```bash
npm run build
```

Vite outputs a `dist/` directory. In the planned AWS architecture, those static files are uploaded to S3 and served globally through CloudFront. The frontend then calls the deployed FastAPI backend URL configured by environment variable.
