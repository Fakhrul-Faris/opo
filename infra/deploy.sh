#!/usr/bin/env bash
set -euo pipefail

# Load environment variables from .env (if present)
if [[ -f "../backend/.env" ]]; then
  export $(grep -v '^#' ../backend/.env | xargs)
fi

# Ensure Railway CLI is available
if ! command -v railway &> /dev/null; then
  echo "Railway CLI not found, installing..."
  curl -sSL https://railway.app/install.sh | bash
fi

# Authenticate using the token (expects RAILWAY_TOKEN secret)
if [[ -z "${RAILWAY_TOKEN:-}" ]]; then
  echo "RAILWAY_TOKEN not set. Please add it as a secret or export it." >&2
  exit 1
fi

# Set the token for the current session
export RAILWAY_TOKEN

# Build Docker image (optional – Railway can build from Dockerfile)
# docker build -t ghcr.io/${GITHUB_REPOSITORY}:latest .

# Deploy / start the service on Railway
railway up --service backend

# Print deployed URL (if any)
railway status --service backend | grep "URL" || true
