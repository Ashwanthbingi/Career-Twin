# rag-service/Dockerfile
# Multi‑stage build for the FastAPI RAG service (Railway free tier)
# Base image: Python 3.12 slim – lightweight and fast
FROM python:3.12-slim AS builder

WORKDIR /app

# Copy only the requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies into a virtual environment (isolates layers)
RUN python -m venv /venv && \
    /venv/bin/pip install --no-cache-dir -r requirements.txt

# ---------- Final stage ----------
FROM python:3.12-slim
WORKDIR /app

# Bring the virtual‑env from the builder stage
COPY --from=builder /venv /venv

# Copy the rest of the application code
COPY . .

# Expose a port (Railway will map $PORT at runtime)
EXPOSE 8080

# Ensure the virtual‑env is on the PATH
ENV PATH="/venv/bin:$PATH"

# Default command – Railway injects the $PORT env var
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
