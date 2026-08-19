#!/bin/bash
# Symbiote-OS shutdown

echo "Stopping Symbiote-OS..."
echo

# Kill services by port
for port in 3030 5173; do
  PID=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "  Killing PID $PID (port $port)"
    kill -9 $PID 2>/dev/null || true
  fi
done

echo
echo "Symbiote-OS stopped."
