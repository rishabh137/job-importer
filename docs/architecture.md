# System Architecture – Scalable Job Importer

This document describes the architecture and design decisions behind the
Scalable Job Importer system. The goal of the system is to reliably fetch jobs
from external XML-based APIs, process them asynchronously, and store them in
MongoDB while providing observability through an admin interface.

---

## High-Level Overview

The system follows an **asynchronous, queue-based architecture** to handle
long-running and unreliable external data sources without blocking API requests.

Key architectural goals:
- Scalability
- Fault tolerance
- Non-blocking APIs
- Clear observability
- Real-world data handling

---

## Architecture Diagram (Logical Flow)
Admin UI (Next.js)
|
| POST /api/import-jobs
v
Backend API (Express)
|
| Fetch XML Feeds
v
XML Parsing & Sanitization
|
| Push jobs
v
Redis Queue (Bull)
|
| Concurrent processing
v
Worker Process
|
| Upsert jobs
v
MongoDB
|
| Save metrics
v
Import Logs Collection


---

## Components Breakdown

### 1. Admin UI (Next.js)

- Built using Next.js App Router and Tailwind CSS
- Provides an admin dashboard to:
  - Trigger job imports manually
  - View import history
  - Inspect failed jobs
- Uses backend pagination for scalability
- Displays loading states and graceful empty states

The UI never waits for long-running imports to complete.

---

### 2. Backend API (Node.js + Express)

The backend exposes REST APIs to:

- Trigger job imports (`POST /api/import-jobs`)
- Fetch paginated import history (`GET /api/import-logs`)

Key design decisions:
- Import trigger API is **non-blocking**
- Long-running work is delegated to background processes
- API remains responsive at all times

---

### 3. External XML Job Feeds

- The system fetches job data from external RSS/XML feeds
- Feeds are treated as unreliable by default
- XML responses are sanitized before parsing
- Non-strict parsing is used to handle malformed XML

Empty or invalid feeds are handled gracefully without crashing the system.

---

### 4. Queue Layer (Redis + Bull)

- Each job is pushed into a Redis-backed Bull queue
- Queue enables:
  - Asynchronous processing
  - Controlled concurrency
  - Retry with exponential backoff
- Queue configuration supports:
  - Multiple attempts
  - Exponential retry delays
  - Failure preservation for debugging

This decouples job ingestion from job persistence.

---

### 5. Worker Process

- Worker consumes jobs from the queue
- Jobs are processed concurrently
- Each job is upserted into MongoDB using a unique external identifier
- Errors are rethrown to allow Bull to retry failed jobs

Worker logic is isolated from API logic to improve reliability and scalability.

---

### 6. MongoDB

The system uses MongoDB for persistence:

#### Jobs Collection
- Stores imported job listings
- Uses upsert logic to prevent duplicates
- Supports idempotent imports

#### Import Logs Collection
- Stores metadata for each import run
- Tracks:
  - Source URL
  - Total jobs fetched
  - Total jobs imported
  - Failed jobs with reasons
  - Timestamp

This enables full observability of the import process.

---

## Import Flow (Step-by-Step)

1. Admin clicks **Run Import** in the UI
2. Backend API triggers import asynchronously
3. External XML feeds are fetched
4. XML is sanitized and parsed
5. Each job is added to the Redis queue
6. Worker processes jobs concurrently
7. Jobs are upserted into MongoDB
8. Import metrics are saved to import logs
9. Admin UI refreshes and displays results

---

## Error Handling Strategy

- Network failures use retry with exponential backoff
- Queue job failures are retried automatically
- Failed jobs are logged with reasons
- Empty feeds are treated as valid scenarios
- System never crashes due to external feed issues

---

## Scalability Considerations

- Queue-based design allows horizontal scaling
- Worker count can be increased without code changes
- Backend pagination prevents large payloads
- API remains responsive under load
- Architecture supports future microservice separation

---

## Design Decisions Summary

- Asynchronous imports to avoid blocking APIs
- Queue-based processing for reliability
- Explicit logging for observability
- Graceful handling of real-world data inconsistencies
- Separation of concerns between API, worker, and UI

---

## Conclusion

This architecture ensures that job imports are reliable, scalable, and observable.
It mirrors real-world production systems where external data sources are slow,
unreliable, and unpredictable, while keeping the user experience responsive and clean.