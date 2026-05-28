#!/bin/bash
# ESA Quiz — local development launcher
# Serves static files and WebSocket relay on a single port

PORT=8080

echo ""
echo "  ESA Quiz Server"
echo "  ==============="
echo ""
echo "  Control Panel: http://localhost:$PORT/control.html"
echo "  Display:       http://localhost:$PORT/source.html"
echo ""
echo "  Press Ctrl+C to stop."
echo ""

cd "$(dirname "$0")"
PORT=$PORT node relay.js
