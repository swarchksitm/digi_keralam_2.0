# DigiKeralam Firewall Setup Script
# Run this script as Administrator to allow mobile access

Write-Host "Opening Firewall Ports for DigiKeralam..." -ForegroundColor Cyan

# Frontend (Vite)
New-NetFirewallRule -DisplayName "DigiKeralam Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
Write-Host "Port 5173 (Frontend) Opened." -ForegroundColor Green

# Backend (Django)
New-NetFirewallRule -DisplayName "DigiKeralam Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
Write-Host "Port 8000 (Backend) Opened." -ForegroundColor Green

Write-Host "Setup Complete! You should now be able to access the app from your mobile device." -ForegroundColor Cyan
Write-Host "Please restart your frontend and backend servers if they were already running." -ForegroundColor Yellow
Start-Sleep -Seconds 5
