# Scalable Job Importer with Queue Processing

This project is a scalable job import system that fetches job listings from external
XML-based APIs, processes them asynchronously using a queue, and stores them in MongoDB.
An admin interface is provided to monitor import history and failures.

The system is designed with scalability, reliability, and real-world data handling in mind.

---

## Features

- Fetch jobs from real external XML/RSS APIs
- Convert XML to JSON with real-world feed error handling
- Background job processing using Redis + Bull queue
- Concurrent worker processing
- Retry with exponential backoff
- MongoDB upsert logic to avoid duplicate jobs
- Import history tracking with detailed metrics
- Manual import trigger from Admin UI
- Paginated admin dashboard
- Failed job inspection via modal
- Graceful handling of empty feeds
- Clean, light-themed admin UI built with Next.js

---

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Redis
- Bull (Queue)
- node-cron

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS

---

## Project Structure
job-importer/
├── client/ # Next.js frontend (Admin UI)
├── server/ # Node.js backend
├── docs/
│ └── architecture.md # System architecture explanation
├── README.md
└── .gitignore


---

## Backend Setup

### 1. Navigate to backend directory

```bash
cd server

2. Install dependencies
npm install

3. Environment variables

Create a .env file inside the server/ directory:

PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

4. Start Redis

Make sure Redis is running locally or via Redis Cloud.

redis-server

5. Run backend server
npm run dev


Backend will start on:

http://localhost:5000

--- 

Frontend Setup:- 
1. Navigate to frontend directory
cd client

2. Install dependencies
npm install

3. Environment variables

Create a .env.local file inside the client/ directory:

NEXT_PUBLIC_API_URL=http://localhost:5000

4. Run frontend server
npm run dev


Frontend will be available at:

http://localhost:3000