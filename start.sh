#!/bin/bash
# Symbiote-OS startup for Venom (Debian 13 + Surface Pro 4)

set -e

cd "$(dirname "$0")"

echo "========================================="
echo "  SYMBIOTE-OS  —  Venom (portable brain)"
echo "========================================="
echo

# Load environment
if [ ! -f .env ]; then
  echo "[error] .env file not found. Run install.sh first."
  exit 1
fi

source .env

# 1. Ensure Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
  echo "[startup] starting Ollama..."
  sudo systemctl start ollama
  sleep 2
fi

# 2. Start Tor (for Tendril)
if ! pgrep -x "tor" > /dev/null; then
  echo "[startup] starting Tor..."
  sudo systemctl start tor
  sleep 2
fi

# 3. Start Orchestrator (:3030)
echo "[startup] orchestrator -> http://localhost:3030"
cd orchestrator
npm install --silent 2>/dev/null || true
npm run dev > /tmp/orchestrator.log 2>&1 &
ORCH_PID=$!
cd ..
sleep 2

# 4. Start Frontend (:5173)
echo "[startup] frontend -> http://localhost:5173"
cd frontend
npm install --silent 2>/dev/null || true
npm run dev > /tmp/frontend.log 2>&1 &
FRONT_PID=$!
cd ..
sleep 3

# 5. Open browser
echo "[startup] opening dashboard..."
xdg-open http://localhost:5173 2>/dev/null || \
  echo "Open http://localhost:5173 in your browser manually"

echo
echo "Symbiote-OS running:"
echo "  • Orchestrator: http://localhost:3030"
echo "  • Frontend: http://localhost:5173"
echo "  • Ollama: http://localhost:11434"
echo "  • Tor: localhost:9050 (SOCKS proxy)"
echo
echo "Logs:"
echo "  • tail -f /tmp/orchestrator.log"
echo "  • tail -f /tmp/frontend.log"
echo
echo "Press Ctrl+C to stop."
echo

wait $ORCH_PID $FRONT_PID
