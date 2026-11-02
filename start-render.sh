#!/usr/bin/env bash
set -euo pipefail

export DATA_DIR="${DATA_DIR:-/opt/render/project/src/data}"
export PYTHON_PORT="${PYTHON_PORT:-5000}"
export PYTHON_API_URL="${PYTHON_API_URL:-http://127.0.0.1:${PYTHON_PORT}}"
export PYTHONIOENCODING="${PYTHONIOENCODING:-utf-8}"
export PYTHONUTF8="${PYTHONUTF8:-1}"
export FLASK_DEBUG="${FLASK_DEBUG:-0}"

mkdir -p "${DATA_DIR}/videos" "${DATA_DIR}/analysis_outputs"

if [ ! -f "${DATA_DIR}/pacientes.json" ] && [ -f "/app/pacientes.json" ]; then
  cp /app/pacientes.json "${DATA_DIR}/pacientes.json"
fi

python3 analisis_api.py &
PYTHON_PID=$!

cleanup() {
  if kill -0 "${PYTHON_PID}" >/dev/null 2>&1; then
    kill "${PYTHON_PID}" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

exec node server.js
