# Team Availability System

A system that allows team members to update and view each other's availability status.

## Project Structure

```
.
├── client/          # React frontend (Vite)
└── server/          # Node.js backend
```

## Getting Started

### Backend Setup (Local)
1. Navigate to server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create .env file with required environment variables:
   ```
   PORT=5000
   JWT_SECRET=jwt_secret
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup (Local)
1. Navigate to client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Seeding Data (Local)
With the server running on port 5000:
```bash
cd server
npm run seed
```

This calls the existing mock endpoints:
- POST /api/users/mock
- POST /api/status/mock

### Docker Setup
Build and run both services with a persisted SQLite volume:
```bash
docker compose up --build
```

Services:
- Client: http://localhost:5173
- Server: http://localhost:5000

Environment variables:
- Server: `PORT` (default 5000), `JWT_SECRET`, `DB_PATH` (compose sets `/app/data/database.sqlite`)
- Client: `VITE_API_URL` (compose sets `http://server:5000` automatically)

Database path behavior:
- Local default: `server/data/database.sqlite` (create folder if missing)
- Override with `DB_PATH` env
- Docker: `DB_PATH=/app/data/database.sqlite` and `./server/data` mounted to `/app/data`

### Notes
- Any endpoint that exposes user data is protected by JWT.
- Status options are served by GET `/api/status/options`.
- “On Vacation” is greyed in the UI list.
- Multi-select filter for statuses is supported.

### cURL examples

Login (returns JWT):
```bash
curl -s -X POST http://localhost:5000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"john.doe","password":"password123"}'
```

Get current user (needs Bearer token):
```bash
curl -s http://localhost:5000/api/user/me \
  -H "Authorization: Bearer YOUR_JWT_HERE"
```

Get statuses:
```bash
curl -s http://localhost:5000/api/status \
  -H "Authorization: Bearer YOUR_JWT_HERE"
```

Update my status:
```bash
curl -s -X PUT http://localhost:5000/api/status \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer YOUR_JWT_HERE" \
  -d '{"status":"Working"}'
```

Seed (default mock users/statuses):
```bash
cd server && npm run seed
```

Seed with custom users via env JSON:
```bash
SEED_USERS='[{"username":"alice","password":"pass"},{"username":"bob","password":"pass"}]' \
  SEED_API_URL=http://localhost:5000 \
  node server/seed.js
```

JWT expiry: tokens expire in 1 hour; if a call returns 401/403, log in again to get a new token and retry.
