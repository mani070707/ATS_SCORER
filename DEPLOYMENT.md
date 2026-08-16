# Free deployment guide

This project is configured for a Render Free FastAPI backend and a Streamlit
Community Cloud frontend. Supabase continues to provide authentication and
database storage.

## 1. Push the deployment files

```bash
git add .
git commit -m "deploy: add Render and Streamlit configuration"
git push origin main
```

Confirm that the local secret file is not tracked:

```bash
git ls-files .env
```

The command must print nothing.

## 2. Create the Render backend

1. Open the Render dashboard and choose **New > Blueprint**.
2. Connect `mani070707/ATS_SCORER` and select `main`.
3. Render detects `render.yaml` and creates `ats-scorer-api`.
4. Enter the required secret environment values when prompted:

   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_KEY`
   - `GROQ_API_KEY`
   - `CORS_ORIGINS` (use `http://localhost:8501` temporarily)

5. Deploy and wait for `/api/v1/health` to report a healthy response.

The Docker image installs `libmagic`, WeasyPrint's Linux libraries, the small
spaCy model, and a cached lightweight Sentence Transformer.

## 3. Create the Streamlit frontend

In Streamlit Community Cloud, create an app with:

```text
Repository: mani070707/ATS_SCORER
Branch: main
Main file: frontend/streamlit_app.py
```

Add these Streamlit secrets, replacing the placeholders:

```toml
[supabase]
SUPABASE_URL = "https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY = "your-anon-or-publishable-key"

[backend]
url = "https://ats-scorer-api.onrender.com"

[google_oauth]
redirect_uri = "https://your-app.streamlit.app"
```

Never add the Supabase service-role key or Groq API key to Streamlit.

## 4. Connect the production URLs

After Streamlit provides its final URL:

1. Set Render's `CORS_ORIGINS` to the exact Streamlit URL without a trailing
   slash. Keep `http://localhost:8501` as a comma-separated second value if
   local development should remain allowed.
2. In Supabase **Authentication > URL Configuration**, set the Site URL to the
   Streamlit URL.
3. Add both the Streamlit URL and `http://localhost:8501` to the allowed
   redirect URLs.
4. Redeploy Render after changing its environment.

## 5. Verify

Test the backend directly:

```bash
curl https://ats-scorer-api.onrender.com/api/v1/health
```

Then test sign-up, sign-in, resume analysis, history, deletion, and PDF export
from the Streamlit URL.

## Free-tier constraints

Render Free has limited CPU and memory and sleeps after inactivity. The first
request after sleep can take approximately a minute. The deployment uses
smaller NLP models to reduce memory, but the process can still exceed the free
instance's limit. Exit code 137 or an out-of-memory message in Render logs
means the service needs further optimization or a larger instance.
