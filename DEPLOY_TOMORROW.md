# Tomorrow Deploy

## Fastest Safe Option

Use one Render web service for the whole app.

This avoids:

- Vercel to Render CORS
- cross-site cookie issues
- frontend/backend URL mismatches

## Service Setup

Open:

```text
https://dashboard.render.com/blueprint/new?repo=https://github.com/Arunteja-ai/personal-assistant1
```

If the default backend-only Blueprint appears, create a manual Render Web Service instead with these exact values:

```text
Name: personal-assistant1-fullstack
Runtime: Node
Branch: main
Root Directory: .
Build Command: npm --prefix frontend ci && npm --prefix frontend run build && npm --prefix backend ci
Start Command: npm --prefix backend start
Health Check Path: /api/health
```

## Environment Variables

Use these exact env vars:

```text
NODE_ENV=production
MONGO_URI=mongodb+srv://assistantAdmin:YOUR_ATLAS_PASSWORD@cluster0.xxxxx.mongodb.net/personal-assistant?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=personal-assistant1-prod-jwt-secret-2026-change-this-now-64chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN_DAYS=14
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
CLIENT_URL=https://personal-assistant1-fullstack.onrender.com
CLIENT_URLS=https://personal-assistant1-fullstack.onrender.com
ADMIN_EMAILS=admin@example.com
```

## Expected Result

Frontend:

```text
https://personal-assistant1-fullstack.onrender.com
```

Backend health:

```text
https://personal-assistant1-fullstack.onrender.com/api/health
```

## Admin Login

Register once with:

```text
Name: Super Admin
Email: admin@example.com
Password: password123
```

Then sign in with the same credentials.
