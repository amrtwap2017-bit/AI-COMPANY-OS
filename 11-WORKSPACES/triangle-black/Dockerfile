# Triangle Black — Production Dockerfile
FROM python:3.12-slim

# Security: run as non-root
RUN groupadd -r tbapp && useradd -r -g tbapp tbapp

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini .

# Set ownership
RUN chown -R tbapp:tbapp /app

# Switch to non-root
USER tbapp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8030/api/v1/health/ready || exit 1

EXPOSE 8030

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8030", \
     "--workers", "2", "--log-level", "warning"]
