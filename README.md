# Codeshashtra

This repo has:

- `backend/`: Express API
- `fateh-education/`: React frontend

## Recommended Hosting

- Frontend on Vercel
- Backend on Railway

This is the best fit for the current codebase because the frontend is a CRA SPA and the backend is a traditional Express server with MongoDB.

## Frontend Deployment

Deploy `fateh-education/` as a separate Vercel project.

- Root directory: `fateh-education`
- Build command: `npm run build`
- Output directory: `build`
- Environment variable: `REACT_APP_API_BASE_URL=https://your-backend-domain`

The file [fateh-education/vercel.json](/c:/Users/Soham/Desktop/Codeshashtra/fateh-education/vercel.json) ensures SPA routes like `/student` and `/book` work on refresh.

## Backend Deployment

Deploy `backend/` as a separate Railway project.

- Root directory: `backend`
- Start command: `npm start`
- Healthcheck path: `/api/health`

Set these environment variables:

- `GROQ_API_KEY`
- `MONGODB_URI`
- `ADMIN_API_KEY`
- `CORS_ORIGIN`

## Local Environment

Copy [backend/.env.example](/c:/Users/Soham/Desktop/Codeshashtra/backend/.env.example) to `backend/.env` and fill in the real values.

## Important

Rotate any secrets currently stored in [backend/.env](/c:/Users/Soham/Desktop/Codeshashtra/backend/.env) before deploying.
