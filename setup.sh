#!/bin/bash

echo "Starting Digi Keralam 2.0 Setup..."

# Check Prerequisites
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
     if ! command -v python &> /dev/null; then
        echo "Error: Python is not installed."
        exit 1
     fi
fi

# Frontend Setup
echo ""
echo "Setting up Frontend..."
if [ -d "frontend" ]; then
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo "Frontend installation failed."
        cd ..
        exit 1
    fi
    cd ..
    echo "Frontend dependencies installed."
else
    echo "Frontend directory not found."
fi

# Backend Setup
echo ""
echo "Setting up Backend..."

# Create Virtual Environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv || python -m venv venv
fi

# Determine pip path
PIP_CMD="./venv/bin/pip"
if [ ! -f "$PIP_CMD" ]; then
    # Windows-style path in checking (unlikely in bash, but handles git bash edge cases sometimes)
    PIP_CMD="./venv/Scripts/pip" 
fi

if [ ! -f "$PIP_CMD" ]; then
     echo "Could not locate venv pip. Using global pip (if available)..."
     PIP_CMD="pip"
fi

# Install Legacy Backend Requirements
if [ -f "legacy_backend/requirements.txt" ]; then
    echo "Installing legacy backend requirements..."
    $PIP_CMD install -r legacy_backend/requirements.txt
fi

# Install Service Requirements
for service in services/*/; do
    if [ -f "${service}requirements.txt" ]; then
        echo "Installing requirements for $(basename "$service")..."
        $PIP_CMD install -r "${service}requirements.txt"
    fi
done

echo ""
echo "Setup Complete!"
echo "To start working:"
echo "1. Activate venv: source venv/bin/activate (or ./venv/Scripts/activate on Git Bash)"
echo "2. Frontend: cd frontend; npm run dev"
echo "3. Backend: Run python legacy_backend/manage.py runserver, etc."
