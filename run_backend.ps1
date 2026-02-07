# Interactive Backend Runner for Digi Keralam 2.0

$venvPython = ".\venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Host "Error: Virtual environment not found. Please run setup.ps1 first." -ForegroundColor Red
    exit
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Digi Keralam 2.0 - Backend Launcher    " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Which service do you want to run?"
Write-Host "1. Legacy Backend (Monolith)" -ForegroundColor Yellow
Write-Host "2. Auth Service" -ForegroundColor Yellow
Write-Host "3. Profile Service" -ForegroundColor Yellow
Write-Host "4. Geography Service" -ForegroundColor Yellow
Write-Host "5. Training Session Service" -ForegroundColor Yellow
Write-Host "6. Attendance Service" -ForegroundColor Yellow
Write-Host "7. Analytics Service" -ForegroundColor Yellow
Write-Host "8. Run Migrations (Fix Database Errors)" -ForegroundColor Green
Write-Host "q. Quit"

$selection = Read-Host "Enter selection (1-8)"

$scriptToRun = ""
switch ($selection) {
    "1" { $scriptToRun = "legacy_backend\manage.py" }
    "2" { $scriptToRun = "services\auth-service\manage.py" }
    "3" { $scriptToRun = "services\profile-service\manage.py" }
    "4" { $scriptToRun = "services\geography-service\manage.py" }
    "5" { $scriptToRun = "services\session-service\manage.py" }
    "6" { $scriptToRun = "services\attendance-service\manage.py" }
    "7" { $scriptToRun = "services\analytics-service\manage.py" }
    "8" { 
        Write-Host "Running migrations for Legacy Backend..." -ForegroundColor Green
        & $venvPython legacy_backend\manage.py migrate

        Write-Host "Running migrations for Auth Service..." -ForegroundColor Green
        & $venvPython services\auth-service\manage.py migrate

        Write-Host "Running migrations for Profile Service..." -ForegroundColor Green
        & $venvPython services\profile-service\manage.py migrate

        Write-Host "Running migrations for Geography Service..." -ForegroundColor Green
        & $venvPython services\geography-service\manage.py migrate

        Write-Host "Running migrations for Session Service..." -ForegroundColor Green
        & $venvPython services\session-service\manage.py migrate

        Write-Host "Running migrations for Attendance Service..." -ForegroundColor Green
        & $venvPython services\attendance-service\manage.py migrate

        Write-Host "Running migrations for Analytics Service..." -ForegroundColor Green
        & $venvPython services\analytics-service\manage.py migrate

        Read-Host "All migrations complete. Press Enter to continue..."
        exit
    }
    "9" {
        Write-Host "Seeding Data for Auth Service..." -ForegroundColor Green
        # Try running the auth service specific seeder if it exists, or the root one
        if (Test-Path "services\auth-service\create_users.py") {
             # We need to run this within the shell context of the service usually, 
             # but let's try running it as a standalone script first
             # It likely needs django setup.
             Write-Host "Please use the Django shell to seed data properly or ensure the script sets up Django env."
             Write-Host "Running: python services/auth-service/manage.py shell < services/auth-service/create_users.py"
             # PowerShell redirection is tricky with & operator.
             # Let's try a simpler approach or just run the root create_users.py if compatible
             & $venvPython services/auth-service/create_users.py
        } elseif (Test-Path "create_users.py") {
             # This seems to be the main one
             & $venvPython create_users.py
        }
        Read-Host "Seeding complete. Press Enter to continue..."
        exit
    }
    "q" { exit }
    Default { Write-Host "Invalid selection."; exit }
}

if ($scriptToRun) {
    $port = "8000"
    if ($selection -ne "1") {
        # Auto-assign ports based on docker-compose logic if needed, 
        # or just ask user. For now, running individual services on 8000 is fine 
        # unless running multiple. Let's default to standard dev ports.
        switch ($selection) {
            "2" { $port = "8001" }
            "3" { $port = "8003" } # Port mapping from docker-compose
            "4" { $port = "8002" }
            "5" { $port = "8004" }
            "6" { $port = "8005" }
            "7" { $port = "8006" }
        }
    }
    
    Write-Host "Starting $scriptToRun on port $port..." -ForegroundColor Green
    & $venvPython $scriptToRun runserver $port
}
