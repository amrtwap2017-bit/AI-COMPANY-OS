FROM python:3.14-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir -e ".[api]"

# Application code
COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "AI_COMPANY_OS.10_ENGINEERING_HUB.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--reload"]
