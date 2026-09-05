import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import(
    ALLOWED_ORIGINS, 
    APP_DESCRIPTION, 
    APP_TITLE, 
    APP_VERSION, 
    SPACY_MODEL_PRIMARY, 
    SPACY_MODEL_SECONDARY,
    validate_runtime_config,
)
from backend.api.routes import router

logger = logging.getLogger('uvicorn.error')


def _load_models():
    """Load CPU-heavy NLP models outside the server's startup path."""
    import spacy
    from backend.services.embedding import HashingTextEmbedder

    logger.info(f'Loading spaCy NLP model: {SPACY_MODEL_PRIMARY}')
    try:
        nlp = spacy.load(SPACY_MODEL_PRIMARY)
        logger.info(f'Loaded {SPACY_MODEL_PRIMARY}')
    except OSError:
        logger.warning(f'{SPACY_MODEL_PRIMARY} not found — falling back to {SPACY_MODEL_SECONDARY}')
        nlp = spacy.load(SPACY_MODEL_SECONDARY)
        logger.info(f'Loaded {SPACY_MODEL_SECONDARY} (fallback)')

    logger.info('Loading low-memory hashing text embedder')
    embedder = HashingTextEmbedder()
    logger.info('Loaded low-memory hashing text embedder')
    return nlp, embedder


async def _initialize_models(app: FastAPI) -> None:
    try:
        app.state.nlp, app.state.embedder = await asyncio.to_thread(_load_models)
        app.state.model_error = None
        logger.info('All models loaded. API is ready to serve analysis requests.')
    except Exception as exc:
        app.state.model_error = str(exc)
        logger.exception('Model initialization failed')

@asynccontextmanager
async def lifespan(app:FastAPI):
    logger.info('Starting ATS Resume Analyzer API...')

    config_errors = validate_runtime_config()
    if config_errors:
        formatted = '\n- '.join(config_errors)
        raise RuntimeError(f'Invalid runtime configuration:\n- {formatted}')

    app.state.nlp = None
    app.state.embedder = None
    app.state.model_error = None
    app.state.model_load_task = asyncio.create_task(_initialize_models(app))

    yield

    if not app.state.model_load_task.done():
        app.state.model_load_task.cancel()
    logger.info('Shutting down the API')

app=FastAPI(
    title=APP_TITLE, 
    description=APP_DESCRIPTION, 
    version=APP_VERSION, 
    lifespan=lifespan,
    docs_url='/docs',
    redoc_url='/redoc'
)

app.add_middleware(
    CORSMiddleware, 
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True, 
    allow_methods     = ['*'],
    allow_headers     = ['*'],

)

app.include_router(router)

@app.get('/')
async def root():
    return {
        'name':      'ATS Resume Analyzer API',
        'version':   '2.0.0',
        'endpoints': {
            'POST   /api/v1/analyze-resume': 'Analyze a resume',
            'GET    /api/v1/history':        'Get user history',
            'DELETE /api/v1/history/:id':    'Delete a history entry',
            'GET    /api/v1/health':         'Health check',
            'POST   /api/v1/generate-pdf':   'Generate PDF report from data',
        },
    }

if __name__=='__main__':
    import uvicorn
    uvicorn.run(
        'backend.main:app',
        host    = '0.0.0.0',
        port    = 8000,
        reload  = True,    # Auto-restart on code changes (dev only)
    )
