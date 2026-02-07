# PowerShell Setup Script for Digi Keralam 2.0

Write-Host "Starting Digi Keralam 2.0 Setup..." -ForegroundColor Cyan

# Check for Prerequisites
function Check-Command ($cmd, $name) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Host "Error: $name is not installed or not in PATH." -ForegroundColor Red
        return $false
    }
    return $true
}

if (-not (Check-Command "node" "Node.js")) { exit 1 }
if (-not (Check-Command "npm" "npm")) { exit 1 }
if (-not (Check-Command "python" "Python")) { exit 1 }
if (-not (Check-Command "pip" "pip")) { exit 1 }

# Frontend Setup
Write-Host "`nSetting up Frontend..." -ForegroundColor Yellow
if (Test-Path "frontend") {
    Push-Location "frontend"
    Write-Host "Installing frontend dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Frontend installation failed." -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Host "Frontend dependencies installed." -ForegroundColor Green
} else {
    Write-Host "Frontend directory not found." -ForegroundColor Red
}

# Backend Setup
Write-Host "`nSetting up Backend..." -ForegroundColor Yellow

# Create Virtual Environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv venv
}

# Activate Virtual Environment
Write-Host "Activating virtual environment..."
$venvPath = ".\venv\Scripts\Activate.ps1"
if (Test-Path $venvPath) {
    # We can't really "activate" it in the current shell for the script effectively in all cases without dot sourcing,
    # but we can call pip via the venv directly to ensure packages go there.
    # However, standard practice in scripts is often to use the venv's python/pip executables.
    $pipPath = ".\venv\Scripts\pip.exe"
    $pythonPath = ".\venv\Scripts\python.exe"
} else {
    Write-Host "Could not find virtual environment activation script. attempting global pip (use with caution)..." -ForegroundColor Yellow
    $pipPath = "pip"
    $pythonPath = "python"
}

# Install Legacy Backend Requirements
if (Test-Path "legacy_backend\requirements.txt") {
    Write-Host "Installing legacy backend requirements..."
    & $pipPath install -r legacy_backend\requirements.txt
}

# Install Service Requirements
$services = Get-ChildItem "services" -Directory
foreach ($service in $services) {
    $reqPath = Join-Path $service.FullName "requirements.txt"
    if (Test-Path $reqPath) {
        Write-Host "Installing requirements for $($service.Name)..."
        & $pipPath install -r $reqPath
    }
}

Write-Host "`nSetup Complete!" -ForegroundColor Green
Write-Host "To start working:"
Write-Host "1. Activate venv: .\venv\Scripts\Activate.ps1"
Write-Host "2. Frontend: cd frontend; npm run dev"
Write-Host "3. Backend: Python services can be run individually (e.g., python legacy_backend/manage.py runserver)"
