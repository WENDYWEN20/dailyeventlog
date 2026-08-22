# Daily Event Log

A personal time-tracking app (web + iOS) inspired by **Aleksandr Lyubishchev** (Александр Александрович Любищев), the Soviet scientist who meticulously recorded every productive hour of his life for 56 years — and used that data to become one of history's most prolific researchers.

> *"He tracked every minute of his life for 56 years and developed a productivity system like no other."*
> — [The Great Randomizer](https://greatrandomizer.substack.com/p/a-simple-yet-powerful-productivity)

---

## What Is the Lyubishchev Method?

Lyubishchev's system has five pillars:

| Step | Description |
|------|-------------|
| **1. Planning** | Define goals across three timeframes: monthly objectives, annual goals, and 5-year visions |
| **2. Time Recording** | Log every productive activity with its duration (e.g., `Deep Work – Algorithm Design: 2h 30m`) |
| **3. Accounting** | Summarize and categorize logged time at the end of each month |
| **4. Summary & Review** | Conduct daily, monthly, and yearly retrospectives against your goals |
| **5. Implementation** | Record only focused, productive time — not casual breaks or conversations |

The key insight: treat time as a measurable resource, log it honestly, and let the data guide your planning.

---

## Features (Planned)

- **Event logging** — record what you did, when, and how long it took
- **Categories** — tag entries by project or activity type (e.g., Deep Work, Learning, Admin)
- **Duration tracking** — log time in hours/minutes (e.g., `1h 45m`, `0h 30m`)
- **Daily summary** — see total productive time per day, broken down by category
- **Monthly report** — aggregate view across the month with category breakdowns
- **Goal tracking** — set monthly, annual, and 5-year goals and track progress toward them
- **Analytics dashboard** — charts showing time allocation trends over time

---

## Tech Stack

### Architecture Overview

```
iOS App (React Native)  ←─┐
                           ├─→  FastAPI Backend  →  PostgreSQL
Web App (React TS)      ←─┘
```

All clients share one backend and one database. Cross-device sync is automatic — no extra sync layer needed.

### Web Frontend
- **React** with **TypeScript**
- State management: React Query / Redux
- UI: Tailwind CSS / shadcn/ui

### iOS App
- **React Native** with **TypeScript** (shares API client and data types with the web app)
- Local offline cache: AsyncStorage or WatermelonDB (so entries can be logged without internet)
- No separate backend — calls the same FastAPI endpoints via JWT auth

> **Why React Native over SwiftUI?** You already know TypeScript, so the learning curve is minimal. You can share the API client, type definitions, and validation logic between the web and iOS projects. If native iOS polish becomes a priority later, a SwiftUI rewrite is still an option.

### Backend
- **FastAPI** (Python)
- **PostgreSQL** via SQLAlchemy (async) + Alembic migrations

#### Why PostgreSQL over MongoDB?
The data is relational and structured:
```
users → goals → time_entries → categories
```
The core value comes from time-series aggregations — daily totals, monthly summaries, category breakdowns. SQL handles these with simple `GROUP BY` and `SUM` queries. PostgreSQL also provides ACID guarantees that protect the integrity of your logs. MongoDB's schema flexibility would go unused here.

### Infrastructure (AWS)

| Component | AWS Service | What it does |
|-----------|-------------|--------------|
| Web frontend | S3 + CloudFront | S3 stores the built React files; CloudFront serves them globally over HTTPS |
| iOS app | Apple App Store | **Not AWS** — distributed via Xcode + Apple Developer account ($99/yr) |
| Backend API | ECS Fargate | Runs the FastAPI Docker container; AWS manages the server for you |
| Database | RDS PostgreSQL | Your PostgreSQL database in the cloud — same as local, different hostname |
| Auth | Amazon Cognito | Issues JWT tokens accepted by both the web app and iOS app |
| CI/CD | GitHub Actions → ECR → ECS | Pushes a new Docker image and redeploys on every git push |

#### How deployment works — step by step

**Web frontend (React → S3 + CloudFront)**
1. Run `npm run build` — produces a `dist/` folder of static HTML/CSS/JS
2. Upload that folder to an S3 bucket (AWS's file storage, like a public folder)
3. Put CloudFront (a CDN) in front of it → users get a fast HTTPS URL anywhere in the world
4. Every time you redeploy, you upload new files and tell CloudFront to clear its cache

**iOS app (React Native → App Store)**
- AWS is not involved in distribution
- You build the app in Xcode, submit it to Apple via App Store Connect
- The app calls your FastAPI backend URL — that's the only AWS connection
- Use TestFlight for beta testing before submitting to the App Store

**Backend (FastAPI → ECS Fargate)**
1. Write a `Dockerfile` that packages your FastAPI app
2. Push the Docker image to ECR (Amazon's private Docker image registry)
3. ECS Fargate pulls that image and runs it as a container — you never touch a server
4. Fargate gives you a public URL (or you put it behind an Application Load Balancer)
5. Both the web app and iOS app call this URL

**Simpler alternative while learning:** run FastAPI on a single EC2 instance (a virtual machine). Less automated, but easier to understand and cheaper.

#### Estimated monthly cost (AWS)

| Service | Free Tier (first 12 months) | After free tier |
|---------|----------------------------|-----------------|
| S3 + CloudFront | Effectively free | < $1/month for a small app |
| EC2 t3.micro (backend) | 750 hrs/month free | ~$8–10/month |
| RDS db.t3.micro (PostgreSQL) | 750 hrs/month free | ~$15–25/month |
| ECS Fargate (0.25 vCPU) | Not included | ~$7–10/month |
| **Total (after free tier)** | | **~$25–40/month** |

**Recommendation:** use the Free Tier for the first year. Start with EC2 + RDS (simpler). Migrate to ECS Fargate later when you're comfortable with Docker.

---

## Project Structure (Planned)

```
dailyeventlog/
├── vitefrontend/               # React + TypeScript web app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── api/            # API client (shared types reusable in iOS)
│   └── package.json
├── ios/                    # React Native iOS app
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   └── api/            # Same API client pattern as web
│   └── package.json
├── fastapiBackend/          # FastAPI app — shared by web and iOS
│   ├── app/
│   │   ├── api/            # Route handlers
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── crud/           # Database queries
│   │   └── core/           # Config, auth, database session
│   ├── alembic/            # Database migrations
│   └── requirements.txt
├── shared/                 # Shared TypeScript types between web and iOS
├── infrastructure/         # AWS CDK or Terraform (optional)
└── docker-compose.yml      # Local development
```

---

## Data Model (Core)

```
users
  id, email, hashed_password, created_at

categories
  id, user_id, name, color

time_entries
  id, user_id, category_id, description, started_at, duration_minutes, created_at

goals
  id, user_id, title, timeframe (daily|monthly|annual|5year), target_hours, created_at
```

---

## Getting Started

> Setup instructions will be added once the project is scaffolded.

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker + Docker Compose
- PostgreSQL (or run via Docker)

### Local Development
```bash
# Start database
docker-compose up -d db

# Backend
cd fastapiBackend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Inspiration

- [A Simple Yet Powerful Productivity System 99% of People Don't Know](https://greatrandomizer.substack.com/p/a-simple-yet-powerful-productivity)
- *This Strange Life* by Daniil Granin (1974) — the book that brought Lyubishchev's story to the world

---

## License

MIT
