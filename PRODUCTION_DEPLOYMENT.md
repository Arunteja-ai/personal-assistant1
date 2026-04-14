# Production Deployment

## 1. Prepare The Repository

This repository currently uses:

- `frontend/` = Vercel client app
- `backend/` = Render server app

If you want a literal `client/` and `server/` folder layout before pushing, run:

```powershell
Move-Item C:\personalassistant\frontend C:\personalassistant\client
Move-Item C:\personalassistant\backend C:\personalassistant\server
```

If you keep the current structure, use the deployment settings below exactly.

Create and push a Git repository:

```powershell
cd C:\personalassistant
git init
git branch -M main
git add .
git commit -m "Prepare production deployment"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 2. MongoDB Atlas

1. Open `https://cloud.mongodb.com`
2. Create a project.
3. Create an `M0` cluster.
4. Go to `Database Access` -> `Add New Database User`
5. Create:
   - Username: `assistantAdmin`
   - Password: generate a strong password and save it
6. Go to `Network Access` -> `Add IP Address`
7. Add:
   - `0.0.0.0/0`
8. Go to `Clusters` -> `Connect` -> `Drivers` -> `Node.js`
9. Copy the connection string:

```text
mongodb+srv://assistantAdmin:<PASSWORD>@<cluster-name>.mongodb.net/personal-assistant?retryWrites=true&w=majority&appName=<cluster-name>
```

## 3. Render Backend

Use the repository root `render.yaml`, or create the service manually in the Render dashboard.

### Render Dashboard Values

- Service Type: `Web Service`
- Runtime: `Node`
- Root Directory: `backend`
- Build Command: `npm ci`
- Start Command: `npm start`
- Health Check Path: `/api/health`

### Render Environment Variables

Set these in `Render Dashboard -> Environment`:

```text
NODE_ENV=production
MONGO_URI=mongodb+srv://assistantAdmin:<PASSWORD>@<cluster-name>.mongodb.net/personal-assistant?retryWrites=true&w=majority&appName=<cluster-name>
JWT_SECRET=<generate-a-64-character-secret>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=14
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
CLIENT_URL=https://<your-vercel-domain>.vercel.app
CLIENT_URLS=https://<your-vercel-domain>.vercel.app,https://<your-custom-domain>
CLIENT_URL_PATTERNS=https://*.vercel.app
ADMIN_EMAILS=admin@example.com
```

### Backend URL Format

```text
https://personal-assistant1-api-arunteja-ai.onrender.com
```

### Backend Verification

```powershell
curl https://personal-assistant1-api-arunteja-ai.onrender.com/api/health
```

## 4. Vercel Frontend

1. Open `https://vercel.com/new`
2. Import the same GitHub repository.
3. Configure:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Vercel Environment Variable

```text
VITE_API_URL=https://personal-assistant1-api-arunteja-ai.onrender.com
```

### Frontend URL Format

```text
https://ai-personal-assistant-dashboard.vercel.app
```

## 5. Final Integration Order

Deploy in this order:

1. Push repo to GitHub
2. Create MongoDB Atlas cluster and copy `MONGO_URI`
3. Deploy backend to Render
4. Copy the real Render URL
5. Set `VITE_API_URL` in Vercel to the Render URL
6. Deploy frontend to Vercel
7. Copy the real Vercel URL
8. Update Render:

```text
CLIENT_URL=https://<actual-vercel-domain>.vercel.app
CLIENT_URLS=https://<actual-vercel-domain>.vercel.app
```

9. Redeploy Render once after updating `CLIENT_URL` and `CLIENT_URLS`

## 6. Production Smoke Test

Run this after both deployments are live:

```powershell
powershell -ExecutionPolicy Bypass -File C:\personalassistant\scripts\production-smoke-test.ps1 -FrontendUrl https://<your-vercel-domain>.vercel.app -BackendUrl https://<your-render-domain>.onrender.com
```

Expected result:

```json
{"frontendStatus":200,"backendHealthStatus":200,"registeredEmail":"prodtest...@example.com","loginRole":"user","dashboardDataKeys":"totals,productivitySeries,financeSeries,goalBreakdown,topHabits,upcomingGoals,recentNotes,recentLogs"}
```

## 7. Exact Production Files

- Frontend env file: `frontend/.env.example`
- Backend env file: `backend/.env.example`
- Render blueprint: `render.yaml`
- Smoke test: `scripts/production-smoke-test.ps1`
