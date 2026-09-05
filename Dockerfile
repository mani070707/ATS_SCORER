FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    SPACY_MODEL_PRIMARY=en_core_web_sm \
    SPACY_MODEL_SECONDARY=en_core_web_sm

WORKDIR /app

# Runtime libraries for file-type detection and WeasyPrint PDF rendering.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libmagic1 \
        libcairo2 \
        libpango-1.0-0 \
        libpangoft2-1.0-0 \
        libgdk-pixbuf-2.0-0 \
        libffi8 \
        shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-backend.txt .
RUN python -m pip install --upgrade pip \
    && python -m pip install -r requirements-backend.txt \
    && python -m spacy download en_core_web_sm

COPY backend ./backend

RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 10000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
