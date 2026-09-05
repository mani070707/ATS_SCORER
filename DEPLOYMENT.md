# Deployment guide

The application uses FastAPI on Render and the React frontend on Vercel.
Supabase provides authentication and analysis history.

## Backend — Render

Create the service from `render.yaml` and configure:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_KEY` (service-role key; never expose it to the browser)
- `GROQ_API_KEY`
- `CORS_ORIGINS` (the exact Vercel URL and any approved preview URLs)

Wait for `/api/v1/health` to report `healthy`. A sleeping free instance may
take about a minute to warm up.

## Frontend — Vercel

Import the repository into Vercel with:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Configure only these browser-safe values:

```env
VITE_API_BASE_URL=https://ats-scorer-api.onrender.com
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

The included `vercel.json` provides SPA route fallback.

## Supabase URLs

In **Authentication → URL Configuration**:

1. Set the Site URL to the production Vercel URL.
2. Add `http://localhost:5173/auth/callback` for local development.
3. Add `https://your-app.vercel.app/auth/callback` for production.
4. Add preview callback patterns only for trusted preview deployments.

After the production URL is known, add it to Render's `CORS_ORIGINS` and
redeploy. Verify signup, OAuth, analysis, history, deletion, and PDF downloads.
