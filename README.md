# ATS Scorer — AI Resume Analyzer

An end-to-end resume analysis platform that evaluates a resume for ATS compatibility, compares it with a job description, validates whether listed skills are supported by experience, and returns practical improvement suggestions.

I built this project to explore how traditional resume heuristics, semantic embeddings, large language models, and a modern web stack can work together in one useful product. The repository contains both the user-facing application and the notebooks used for data exploration and BERT experiments.

> **Project status:** Active personal project. The web application is configured for local development; the research notebooks still require the datasets and trained-model artifacts listed in [Known limitations](#known-limitations).

## What the project does

A user can:

- Create an account or sign in through Supabase authentication.
- Upload a PDF, DOC, or DOCX resume up to 5 MB.
- Add an optional job description for role-specific analysis.
- Receive an overall ATS score and a five-part score breakdown.
- See matched keywords, missing keywords, and skill gaps.
- Check whether skills are demonstrated in projects or work experience.
- Review detailed issues, explanations, and suggested improvements.
- Save previous analyses and revisit them from a history page.
- Export an analysis as a PDF report.

## Why I built it

Most resume checkers provide a single score without explaining how it was calculated. My goal was to build a more transparent system that combines:

1. Rule-based ATS checks for structure and measurable achievements.
2. LLM-based extraction of structured resume and job information.
3. Semantic matching for text that has the same meaning but different wording.
4. Evidence-based skill validation against projects and experience.
5. Actionable feedback instead of a score alone.

## Technology stack

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | Streamlit | Authentication UI, uploads, results, history, and resources |
| Backend | FastAPI | API routes, orchestration, authentication, and validation |
| Resume parsing | pdfplumber, PyPDF2, python-docx | Extract text and hyperlinks from uploaded documents |
| Structured extraction | Groq, Llama 3.3 70B | Extract resume and job-description data as JSON |
| NLP | spaCy `en_core_web_md` | Named-entity and location analysis |
| Embeddings | Sentence Transformers `all-MiniLM-L6-v2` | Semantic comparison and skill evidence matching |
| Authentication | Supabase Auth | Email/password and Google OAuth sessions |
| Database | Supabase Postgres + REST API | Persist and retrieve analysis history |
| Reports | Jinja2 + WeasyPrint | Build downloadable PDF reports |
| Research | Jupyter, pandas, scikit-learn, Sentence Transformers | EDA, embedding experiments, and BERT fine-tuning |

## Architecture

```mermaid
flowchart LR
    U["User"] --> FE["Streamlit frontend"]
    FE --> SA["Supabase Auth"]
    FE -->|"Resume, job description, JWT"| API["FastAPI backend"]

    API --> AUTH["JWT verification"]
    AUTH --> SA
    API --> FILE["Document parser"]
    FILE --> GROQ["Groq structured extraction"]
    GROQ --> SCORE["ATS scoring pipeline"]
    SCORE --> NLP["spaCy"]
    SCORE --> EMB["Sentence Transformer"]
    SCORE --> DB["Supabase analysis history"]
    SCORE --> FE

    FE -->|"Export request"| PDF["Jinja2 and WeasyPrint"]
    PDF --> FE
```

### Main components

#### Streamlit frontend

The frontend manages navigation, account state, resume uploads, job-description input, score visualization, feedback, analysis history, and PDF downloads. It sends authenticated requests to FastAPI and never calculates the ATS score itself.

#### FastAPI backend

The backend owns the analysis pipeline. On startup it loads spaCy and the Sentence Transformer into application memory so they can be reused between requests. Protected endpoints verify the Supabase access token before processing user data.

#### Supabase

Supabase has two responsibilities:

- Authenticate users and issue access tokens.
- Store analysis results associated with the authenticated user ID.

The backend uses the service-role key for database operations. This key must never be exposed to the browser or committed to Git.

#### NLP and LLM layer

Groq converts unstructured resume and job-description text into predictable JSON fields such as skills, experience, projects, keywords, and action verbs. spaCy and Sentence Transformers are then used for entity analysis and semantic similarity.

## How an analysis works

```mermaid
sequenceDiagram
    actor User
    participant UI as Streamlit
    participant Auth as Supabase Auth
    participant API as FastAPI
    participant AI as Groq and NLP models
    participant DB as Supabase Database

    User->>UI: Upload resume and enter job description
    UI->>Auth: Obtain authenticated session
    UI->>API: Submit file, JD, and bearer token
    API->>Auth: Verify JWT
    API->>API: Validate file and extract text
    API->>AI: Extract structured resume and JD data
    AI->>AI: Calculate keyword and semantic matches
    AI->>API: Return structured analysis
    API->>API: Calculate component and overall scores
    API->>DB: Save analysis for the user
    API-->>UI: Return score, issues, and recommendations
    UI-->>User: Display dashboard and export options
```

The detailed pipeline is:

1. **Authentication** — the frontend attaches a Supabase access token to the request.
2. **File validation** — the backend checks the file size and detected MIME type.
3. **Text extraction** — PDF extraction uses pdfplumber with PyPDF2 as a fallback; DOCX files use python-docx.
4. **Structured parsing** — Groq extracts contact details, skills, experience, education, projects, action verbs, and keywords.
5. **JD parsing** — when supplied, the job description is converted into required skills, preferred skills, responsibilities, and keywords.
6. **Semantic comparison** — Sentence Transformers calculate similarity between resume content and the job description.
7. **Skill validation** — each claimed skill is checked against project and experience evidence using exact and semantic matching.
8. **ATS scoring** — rule-based component scores are combined into a score out of 100.
9. **Feedback generation** — detected issues are converted into explanations, action items, and examples.
10. **Persistence** — the result is saved to Supabase and returned to the frontend.

## ATS scoring model

The final score is a weighted sum of five components:

| Component | Maximum | What it considers |
| --- | ---: | --- |
| Formatting | 20 | Core sections, summary, projects, bullets, and structural completeness |
| Keywords | 25 | Resume keywords, skills, and fuzzy JD keyword coverage |
| Content quality | 25 | Action verbs, quantified achievements, and grammar penalty inputs |
| Skill validation | 15 | Skills supported by project or work-experience evidence |
| ATS compatibility | 15 | Machine-readable structure and compatibility heuristics |
| **Total** | **100** | Sum of all component scores |

For JD comparison, the project combines keyword matching and semantic similarity. The configured weights are 60% keyword coverage and 40% semantic similarity.

The score is a project-specific heuristic, not a score produced by a particular employer's ATS. It should be treated as guidance rather than a hiring prediction.

## Application and notebook models

The runtime application and research notebooks currently use different model paths:

- The FastAPI application loads `all-MiniLM-L6-v2` by default.
- The embedding notebook experiments with `all-mpnet-base-v2`.
- The fine-tuning notebook trains and loads a model from `models/finetuned-bert`.
- The fine-tuned notebook model is **not currently connected to the backend**.

This separation keeps experimentation independent from the production pipeline, but integrating and evaluating the fine-tuned model is part of the roadmap.

## Repository structure

```text
ATS_SCORER/
├── backend/
│   ├── api/                 # API routes and Supabase JWT verification
│   ├── core/                # Application and model configuration
│   ├── database/            # Supabase REST persistence
│   ├── models/              # Pydantic request/response schemas
│   ├── services/            # Parsing, scoring, matching, feedback, reports
│   ├── templates/           # HTML fragments used for PDF reports
│   ├── utils/               # File utilities and matching helpers
│   └── main.py              # FastAPI application entry point
├── frontend/
│   ├── .streamlit/          # Streamlit configuration
│   ├── assets/              # CSS and static assets
│   ├── components/          # Reusable result components
│   ├── services/            # Backend and Supabase clients
│   ├── views/               # Landing, scorer, history, and resources pages
│   └── streamlit_app.py     # Streamlit entry point
├── jupyter notebooks/
│   ├── 01_EDA_and_DATA_prep.ipynb
│   ├── 02_BERT_EMBEDDINGS.ipynb
│   └── 03_BERT_FINETUNEipynb.ipynb
├── requirements.txt
└── README.md
```

## Local setup

### Prerequisites

- Python 3.10 or 3.11
- A Groq API key
- A Supabase project
- Git
- System libraries required by WeasyPrint

### 1. Clone the repository

```bash
git clone https://github.com/mani070707/ATS_SCORER.git
cd ATS_SCORER
```

### 2. Create a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

On Windows PowerShell, activate it with:

```powershell
.venv\Scripts\Activate.ps1
```

### 3. Install application dependencies

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_md
```

WeasyPrint may require extra system packages on Linux:

```bash
# Ubuntu/Debian
sudo apt install libcairo2 libpango-1.0-0 libpangoft2-1.0-0 libffi-dev
```

### 4. Configure environment variables

Create `.env` in the repository root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
GROQ_API_KEY=your-groq-api-key
AUTH_REDIRECT_URL=http://localhost:8501
SENTENCE_TRANSFORMER_MODEL=all-MiniLM-L6-v2
```

Environment-variable responsibilities:

| Variable | Required | Used for |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Authentication, JWT keys, and database REST API |
| `SUPABASE_KEY` | Yes | Backend service-role database operations |
| `SUPABASE_ANON_KEY` | Yes | Frontend authentication client |
| `SUPABASE_JWT_SECRET` | Depends on JWT algorithm | Verification of HS256 access tokens |
| `GROQ_API_KEY` | Yes | Resume and job-description extraction |
| `AUTH_REDIRECT_URL` | For OAuth | Google OAuth callback URL |
| `SENTENCE_TRANSFORMER_MODEL` | No | Override the default embedding model |

Never commit `.env`, a service-role key, or Streamlit secrets.

### 5. Create the Supabase table

The backend expects an `analyses` table with this minimum shape:

```sql
create table if not exists public.analyses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    filename text not null,
    ats_score double precision default 0,
    keyword_match double precision default 0,
    missing_keywords jsonb default '[]'::jsonb,
    analysis_result jsonb not null,
    created_at timestamptz not null default now()
);

create index if not exists analyses_user_created_idx
    on public.analyses (user_id, created_at desc);
```

The service-role key bypasses Row Level Security in backend requests. Keep it server-side. For defense in depth, enable RLS and add policies if the table will also be accessed directly by clients.

### 6. Configure authentication

In Supabase:

1. Enable email/password authentication.
2. Add `http://localhost:8501` to the allowed redirect URLs.
3. Optionally configure Google as an OAuth provider.
4. Add the production Streamlit URL before deployment.

### 7. Start the backend

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Useful backend URLs:

- API root: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

The first startup downloads the Sentence Transformer model and may take longer than later starts.

### 8. Start the frontend

Open a second terminal, activate the same environment, and run:

```bash
streamlit run frontend/streamlit_app.py
```

The application opens at `http://localhost:8501` and connects to the backend at `http://localhost:8000` by default.

## API overview

All routes except the health check require a Supabase bearer token.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Confirm that runtime models are loaded |
| `POST` | `/api/v1/analyze-resume` | Analyze an uploaded resume and optional JD |
| `GET` | `/api/v1/history` | Return the signed-in user's analyses |
| `DELETE` | `/api/v1/history/{id}` | Delete one owned analysis |
| `POST` | `/api/v1/generate-pdf` | Generate a report from analysis data |
| `GET` | `/api/v1/history/{id}/pdf` | Generate a report from saved history |

Example analysis request:

```bash
curl -X POST http://localhost:8000/api/v1/analyze-resume \
  -H "Authorization: Bearer YOUR_SUPABASE_ACCESS_TOKEN" \
  -F "resume=@/path/to/resume.pdf" \
  -F "job_description=We are looking for a Python developer with FastAPI and SQL experience."
```

## Running the notebooks

The notebooks are research artifacts and are not required to start the web application.

Install their additional dependencies:

```bash
pip install -r requirements.txt -r requirements-notebooks.txt
jupyter lab
```

Run them in this order:

1. `01_EDA_and_DATA_prep.ipynb` — explores and cleans resume/JD pairs.
2. `02_BERT_EMBEDDINGS.ipynb` — creates embeddings and evaluates similarity.
3. `03_BERT_FINETUNEipynb.ipynb` — fine-tunes and evaluates the Sentence Transformer.

The notebooks currently expect files such as:

```text
dataset/resumeJD_pairs.csv
cleaned_resumeJD_pairs.csv
models/finetuned-bert/
```

These dataset and trained-model artifacts are not included in the current repository, so they must be supplied or regenerated before every notebook can be executed end to end.

## Security and privacy

- Resume content is extracted in backend memory; the uploaded source document is not intentionally stored by this code.
- Parsed analysis results are saved to Supabase when database configuration is present.
- Resume text is sent to Groq for structured extraction, so users should understand the external data-processing implications.
- Access tokens are verified by the backend and user identity comes from the token, not from a client-provided user ID.
- Database queries filter history and deletion operations by authenticated user ID.
- Service-role and Groq keys belong only in server-side environment configuration.
- Production deployments should use HTTPS, strict CORS origins, secret rotation, rate limiting, and explicit retention policies.

## Design considerations

### Performance

The spaCy and embedding models are loaded once during FastAPI startup rather than for every request. Semantic models are cached locally after their first download. Groq and Supabase calls remain network-dependent and can dominate request latency.

### Scalability

For a larger deployment, I would:

- Run Streamlit and FastAPI as independently scalable services.
- Move long analyses and PDF generation into background workers.
- Add request queues, rate limits, retries, and timeouts around external APIs.
- Cache repeated embeddings and batch skill comparisons.
- Store generated reports in object storage with expiring links.
- Add observability for latency, failures, and model-quality metrics.
- Replace service-role REST access with a more narrowly scoped persistence layer.

### Reliability

The parser uses two PDF extraction implementations for resilience. Database history writes are non-blocking, allowing an analysis response even if persistence fails. A production version should also include structured retries and clearer partial-failure reporting.

## Known limitations

- Groq is required by the current analysis pipeline; there is no local parsing fallback.
- Dataset CSV files and fine-tuned model artifacts used by the notebooks are absent.
- Notebook dependencies are maintained separately in `requirements-notebooks.txt`.
- The fine-tuned BERT model is not connected to the live application.
- Grammar and some location-analysis inputs currently use default placeholder results in the orchestration pipeline.
- Scanned image-only PDFs do not have OCR support.
- Legacy binary `.doc` extraction may depend on detected MIME type but has no dedicated parser equivalent to DOCX.
- Focused configuration and Groq parser tests are included; broader API, integration, and end-to-end coverage is still needed.
- A Supabase migration is included, but deployment manifests are not yet included.

## Roadmap

- [x] Fix the current startup and Groq parsing defects.
- [x] Add `.env.example` and Streamlit secrets templates.
- [x] Add a repeatable Supabase SQL migration and RLS policies.
- [ ] Expand unit tests for scoring, file parsing, matching, and authentication.
- [ ] Add integration tests for API and database flows.
- [ ] Evaluate and integrate the fine-tuned embedding model.
- [ ] Add OCR support for scanned resumes.
- [ ] Add a local parsing fallback when Groq is unavailable.
- [ ] Add model-quality evaluation and score calibration.
- [ ] Add Docker and deployment configuration.
- [ ] Add screenshots, a recorded demo, and a hosted application link.
- [ ] Add consent, retention, and account-data deletion controls.

## Troubleshooting

### spaCy model not found

```bash
python -m spacy download en_core_web_md
```

### Frontend cannot reach the backend

Confirm that FastAPI is running on port 8000 and check:

```bash
curl http://localhost:8000/api/v1/health
```

### Authentication is not configured

Verify `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and the backend JWT configuration. Restart both processes after changing `.env`.

### Groq analysis fails

Confirm that `GROQ_API_KEY` is valid and that the configured Groq model is available to the account.

### PDF export fails

Install the operating-system libraries required by WeasyPrint, then restart the backend.

## Deployment

The repository includes a production Dockerfile, a Render Blueprint, and a
frontend-only dependency manifest for a free-tier deployment. Follow the
step-by-step instructions in [DEPLOYMENT.md](DEPLOYMENT.md).

## Author

**Manideep**

- GitHub: [@mani070707](https://github.com/mani070707)
- Project repository: [mani070707/ATS_SCORER](https://github.com/mani070707/ATS_SCORER)

## Contributing

This is a personal learning project, but constructive issues and pull requests are welcome. For significant changes, open an issue first to discuss the proposed behavior and include tests where possible.

## License

No license file is currently included. Until a license is added, the repository remains under the default copyright rules and reuse is not automatically granted.
