# Digi Keralam 2.0 - Deployment Guide

## Prerequisites
*   **OS**: Ubuntu 22.04 LTS (Recommended)
*   **Database**: PostgreSQL 14+
*   **Web Server**: Nginx
*   **Application Server**: Gunicorn
*   **Runtime**: Python 3.10+, Node.js 18+ (for build)

## Step 1: System Setup
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib nginx git
```

## Step 2: Database Setup
```bash
sudo -u postgres psql
# In psql prompt:
CREATE DATABASE digikeralam_db;
CREATE USER digi_user WITH PASSWORD 'secure_password';
ALTER ROLE digi_user SET client_encoding TO 'utf8';
ALTER ROLE digi_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE digi_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE digikeralam_db TO digi_user;
\q
```

## Step 3: Backend Deployment
1.  Clone repository to `/var/www/digikeralam`.
2.  Set up Virtual Environment:
    ```bash
    cd /var/www/digikeralam/backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install gunicorn psycopg2-binary
    ```
3.  Configure Environment:
    ```bash
    cp .env.example .env
    # Edit .env with production DB credentials and SECRET_KEY
    ```
4.  Run Migrations & Collect Static:
    ```bash
    python manage.py migrate
    python manage.py collectstatic
    ```
5.  Setup Gunicorn Service:
    *   Copy `deployment/gunicorn_config.py` to backend.
    *   Create systemd service file (e.g., `/etc/systemd/system/digikeralam.service`).

## Step 4: Frontend Deployment
1.  Navigate to frontend:
    ```bash
    cd /var/www/digikeralam/frontend
    ```
2.  Install dependencies & Build:
    ```bash
    npm install
    # Ensure .env has correct VITE_API_URL
    npm run build
    ```
3.  Move build artifacts:
    ```bash
    # Nginx root is configured to /var/www/digikeralam/html
    # Ensure this directory exists or update Nginx config
    # Copy dist contents to web root
    ```

## Step 5: Nginx Configuration
1.  Copy `deployment/nginx.conf` to `/etc/nginx/sites-available/digikeralam`.
2.  Enable site:
    ```bash
    sudo ln -s /etc/nginx/sites-available/digikeralam /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## Step 6: SSL (HTTPS)
Use Certbot to secure the domain:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d digikeralam.ksitm.kerala.gov.in
```

## Critical Configuration Checks (Learned from Verification)
1.  **STATIC_ROOT**: Ensure `STATIC_ROOT = BASE_DIR / 'staticfiles'` is in `settings.py` before running `collectstatic`.
2.  **CORS & Hosts**: 
    *   Set `ALLOWED_HOSTS` to include your domain (and `localhost` for testing).
    *   Set `CORS_ALLOWED_ORIGINS` to include the frontend domain (e.g., `https://digikeralam.ksitm.kerala.gov.in`).
3.  **Frontend API Paths**:
    *   The React app expects the API at `/api/auth/login/` and `/api/auth/profile/`.
    *   Ensure Nginx proxies `/api/` correctly to Gunicorn.
    *   Verify `frontend/.env.production` has `VITE_API_URL=https://your-domain.com/api`.

## Maintenance
*   **Logs**: Check `/var/log/gunicorn/` and `/var/log/nginx/`.
*   **Updates**: Pull git changes, re-run migrations, rebuild frontend, restart services.
