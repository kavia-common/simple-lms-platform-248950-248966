# Smoke test (manual) — Simple LMS

## Prereqs
- Start/initialize DB (SQLite) in `lms_database` (creates `myapp.db`).
- Start backend `lms_backend` (FastAPI).
- Start frontend `lms_frontend` (React).

## 1) Database init (one-time)
1. In `simple-lms-platform-248950-248965/lms_database/` run:
   - `python init_db.py`
2. Confirm it created:
   - `myapp.db`
   - `db_connection.txt` includes the absolute file path.

## 2) Backend configuration
Backend env vars (see `lms_backend/.env.example`):
- `JWT_SECRET_KEY` (required)
- `SQLITE_DB_PATH` must point to the DB created above, e.g.
  - `/home/kavia/workspace/code-generation/simple-lms-platform-248950-248965/lms_database/myapp.db`
- `CORS_ALLOW_ORIGINS` should include the frontend origin during dev (or `*`).

## 3) Frontend configuration
Set (optional) `lms_frontend/.env`:
- `REACT_APP_API_BASE_URL=http://localhost:3001`

If not set, frontend defaults to `http://localhost:3001`.

## 4) Core flow smoke checks
### A. Health
- Open backend: `GET /` → `{"message":"Healthy"}`

### B. Login (JWT)
Use seeded DB users from `lms_database/init_db.py` (email shown below).
Note: The backend requires password verification; ensure your backend seed/password hashing matches your expected login.
- `POST /api/auth/login` with:
  - `{"email":"student@example.com","password":"<student password>"}`
- Expect: `access_token` in response.
- `GET /api/auth/me` with `Authorization: Bearer <token>` should return `roles` including `student`.

### C. Catalog
- In UI, open `/` (Catalog).
- Expect courses loaded from API (`/api/courses`). If backend is down, UI shows “Backend unavailable; showing demo data.”

### D. Enroll + My Learning
- From a course page: click **Enroll**.
  - Calls `POST /api/courses/{course_id}/enroll` (JWT required).
- Go to **My Learning**:
  - Calls `GET /api/me/enrollments` (JWT required)
  - Expect the enrolled course to appear.

### E. Progress (lesson completion)
- Open a lesson and click **Mark completed**:
  - Calls `PUT /api/lessons/{lesson_id}/progress` with `{status:"completed", progress_percent:100}` (JWT required).
- Verify backend data via:
  - `GET /api/courses/{course_id}/progress` (JWT required)

## Notes / Known limitations
- Instructor/admin pages are still mostly UI scaffolds; wiring for course creation/editing is not included in this smoke pass.
- Quiz UI remains fully functional in demo/mock mode; API quiz submission wiring requires a reliable way to resolve course_id/quiz_id from slug on the lesson page.
