# Lean container for Phase 1 incubator
FROM python:3.11-slim

# Set up a non-root user for security
RUN useradd -ms /bin/bash appuser
WORKDIR /app

# Install minimal system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy application
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Create artifacts directory
RUN mkdir -p /app/artifacts && chown -R appuser:appuser /app

# Environment: allow overriding Ollama base URL; default to host.docker.internal
ENV OLLAMA_BASE_URL=http://host.docker.internal:11434 \
    INCUBATOR_SPEC=/app/incubator_spec.yaml \
    PYTHONUNBUFFERED=1

USER appuser

EXPOSE 5000

# Start API server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
