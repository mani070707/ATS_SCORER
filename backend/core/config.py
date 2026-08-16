import os
from pathlib import Path
from urllib.parse import urlparse

# Load .env from the project root (two levels up from this file) explicitly —
# load_dotenv() with no args relies on caller-frame inspection that can fail
# silently under uvicorn reload, leaving env vars unset.
try:
    from dotenv import load_dotenv
    _ENV_PATH = Path(__file__).resolve().parents[2] / '.env'
    load_dotenv(_ENV_PATH)
except ImportError:
    pass

#api metadata
APP_TITLE='ATS RESUME ANALYZER API'
APP_VERSION='1.0.0'
APP_DESCRIPTION='analyse resumes against job description using nlp + ml'

def _csv_env(name: str, default: str) -> list[str]:
    return [value.strip().rstrip('/') for value in os.getenv(name, default).split(',') if value.strip()]


ALLOWED_ORIGINS = _csv_env(
    'CORS_ORIGINS',
    'http://localhost:8501,http://127.0.0.1:8501',
)

#file 
MAX_FILE_SIZE_MB=5
MAX_FILE_SIZE_BYTES=MAX_FILE_SIZE_MB*1024*1024

#Supported MIME types and their short names
SUPPORTED_MIME_TYPES = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

SUPPORTED_EXTENSIONS = {'.pdf', '.doc', '.docx'}

SPACY_MODEL_PRIMARY = os.getenv('SPACY_MODEL_PRIMARY', 'en_core_web_md')
SPACY_MODEL_SECONDARY = os.getenv('SPACY_MODEL_SECONDARY', 'en_core_web_sm')
SENTENCE_TRANSFORMER_MODEL = os.getenv("SENTENCE_TRANSFORMER_MODEL", "all-MiniLM-L6-v2")

# Score component weights — this is business logic treated as config
SCORE_WEIGHTS = {
    "formatting": 20, "keywords": 25, "content": 25,
    "skill_validation": 15, "ats_compatibility": 15,
}

JD_KEYWORD_WEIGHT=0.6
JD_SEMANTIC_WEIGHT=0.4

SUPABASE_URL       = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY       = os.getenv('SUPABASE_KEY', '')          # service_role — DB writes (bypasses RLS)
SUPABASE_ANON_KEY  = os.getenv('SUPABASE_ANON_KEY', '')     # public anon — frontend auth calls
SUPABASE_JWT_SECRET= os.getenv('SUPABASE_JWT_SECRET', '')   # used by backend to verify access tokens
GROQ_API_KEY       = os.getenv('GROQ_API_KEY', '')


def validate_runtime_config() -> list[str]:
    """Return actionable configuration errors without exposing secret values."""
    errors = []

    if not SUPABASE_URL:
        errors.append('SUPABASE_URL is not set')
    else:
        parsed = urlparse(SUPABASE_URL)
        if parsed.scheme != 'https' or not parsed.netloc or parsed.path not in ('', '/'):
            errors.append(
                'SUPABASE_URL must be the HTTPS project base URL, for example '
                'https://project-ref.supabase.co (without /rest/v1)'
            )

    if not SUPABASE_ANON_KEY:
        errors.append('SUPABASE_ANON_KEY is not set')
    if not SUPABASE_KEY:
        errors.append('SUPABASE_KEY is not set')
    if not GROQ_API_KEY:
        errors.append('GROQ_API_KEY is not set')

    return errors

