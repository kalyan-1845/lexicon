#!/bin/bash

echo "========================================="
echo "      Starting Lexicon AI Workspace      "
echo "========================================="
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo "[1/3] Starting Backend (FastAPI)..."
cd backend || exit
# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi
uvicorn app.main:app --reload &
BACKEND_PID=$!
cd ..

echo "[2/3] Starting Frontend (Next.js)..."
cd frontend || exit
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Waiting for servers to initialize..."
sleep 5

echo "[3/3] Opening Browser..."
# Detect OS and open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:3000"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:3000"
elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* ]]; then
    start chrome "http://localhost:3000" || start "http://localhost:3000"
fi

echo ""
echo "Lexicon AI is now running!"
echo "Press Ctrl+C to stop both servers."
echo "========================================="

# Wait for background processes to keep script running
wait $BACKEND_PID $FRONTEND_PID
