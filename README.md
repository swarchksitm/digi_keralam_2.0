# Digi Keralam 2.0

> **State-wide Digital Literacy Campaign Management System**

Digi Keralam 2.0 is a comprehensive microservices-based platform designed to manage the digital literacy campaign across Kerala. It handles the hierarchical administrative structure (State -> District -> Block -> LSGI -> Ward), user roles, session scheduling, and attendance tracking.

## 🏗 System Architecture

The system is built using a **Microservices Architecture** with a **Strangler Fig** migration pattern from a legacy monolith.

### Core Services
All services are containerized and orchestrated via Docker Compose.

| Service | Port (Internal) | Description | Database |
| :--- | :--- | :--- | :--- |
| **Gateway** | `8080` (Public) | Single Entry Point (Nginx). Routes requests to backend services. | N/A |
| **Frontend** | `80` | React/TypeScript SPA. Served via Nginx. | N/A |
| **Auth Service** | `8001` | User Identity, RBAC, JWT issuance. | `digi_auth` |
| **Geography** | `8002` | Master Data (Districts, Wards, etc.). | `digi_geo` |
| **Profile** | `8003` | User Profiles & Geo-binding. | `digi_profile` |
| **Session** | `8004` | Training Session Scheduling. | `digi_session` |
| **Attendance** | `8005` | Participant Attendance Tracking. | `digi_attendance` |
| **Analytics** | `8006` | Aggregated Reporting. | `digi_analytics` |

### Tech Stack
- **Backend**: Python 3.11, Django 5.0, Django REST Framework.
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite.
- **Database**: PostgreSQL 14 (Database-per-service pattern).
- **Infrastructure**: Docker, Nginx (Gateway), Gunicorn.

---

## 🚀 Getting Started

### Prerequisites
- **Docker** & **Docker Compose**
- **Git**

### Local Setup (Recommended for Development)
For quick local development without Docker, use the included setup scripts to install all dependencies (Frontend + Backend).

**Windows (PowerShell)**:
```powershell
.\setup.ps1
```

**Linux / macOS (Bash)**:
```bash
chmod +x setup.sh
./setup.sh
```

### Docker Installation


1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd digi_keralam_2.0
    ```

2.  **Environment Setup**
    The project uses a unified configurations. Ensure `.env.production` (frontend) and backend environment variables are set (defaults provided in `docker-compose.yml` for dev).

3.  **Build and Run**
    ```bash
    # Build all services (recommended to force no-cache for fresh dependencies)
    docker-compose build --no-cache

    # Start the stack
    docker-compose up -d
    ```

4.  **Database Initialization & Migrations**
    The system includes an `init.sql` script that automatically creates the required databases. Run the migration script to apply schemas:
    ```bash
    # Make script executable
    chmod +x migrate_system.sh

    # Run migrations for all microservices
    ./migrate_system.sh
    ```

5.  **Seeding Data (Optional but Recommended)**
    To populate the system with administrative hierarchy (14 Districts, etc.) and seeded users:
    ```bash
    docker exec -it digi_keralam_20-auth_service-1 python manage.py seed_data
    ```

---

## 🖥 Usage

Access the application via the **API Gateway**:
**URL**: `http://localhost:8080`

### Default Credentials (Seeded)

| Role | Username | Password |
| :--- | :--- | :--- |
| **State Admin** | `ksitm_admin` | `password123` |
| **District Admin** | `tvm_admin` | `password123` |
| **Master Trainer** | `tvm_master` | `password123` |
| **Field Trainer** | `tvm_field` | `password123` |
| **Citizen** | `citizen_1` | `password123` |

---

## 🛠 Development Guidelines

### Directory Structure
```
.
├── docker-compose.yml      # Orchestration config
├── gateway/                # Nginx API Gateway config
├── frontend/               # React Application
├── services/               # Microservices
│   ├── auth-service/
│   ├── geography-service/
│   ├── profile-service/
│   ├── session-service/
│   ├── attendance-service/
│   └── analytics-service/
└── legacy_backend/         # Retired Monolith (Reference only)
```

### Developing a Service
1.  **Frontend**:
    - Located in `frontend/`.
    - Updates are reflected on refresh (if running in dev mode, currently set to production build for UAT).
    - To edit: Update code, then `docker-compose up -d --build frontend`.

2.  **Backend**:
    - Located in `services/<service-name>`.
    - Each service is an independent Django project.
    - **Logs**: View logs via `docker logs -f <container_name>` (e.g., `docker logs -f digi_keralam_20-auth_service-1`).

### Common Commands
- **Restart Gateway**: `docker-compose restart gateway`
- **Rebuild specific service**: `docker-compose up -d --build --no-deps <service_name>`
- **Shell access**: `docker exec -it <container_name> /bin/bash`

---

## ⚠️ Troubleshooting

**1. 502 Bad Gateway**
- **Cause**: Gateway container started before backend services were ready.
- **Fix**: Wait 30s for services to boot, then restart gateway:
  ```bash
  docker-compose restart gateway
  ```

**2. Database Connection Error**
- **Cause**: Postgres container not healthy.
- **Fix**: Check status `docker ps`. Ensure `init.sql` ran correctly (check logs).

**3. Frontend CORS / Network Error**
- **Cause**: Frontend trying to hit incorrect port (e.g., 8000 instead of 8080).
- **Fix**: Ensure `frontend/.env.production` has `VITE_API_URL=http://localhost:8080/api`.

---

*maintained by KSITM Engineering Team*
