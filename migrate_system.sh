#!/bin/bash
set -e

echo ">>> PHASE 0: MIGRATING DATABASES"

echo "[1/6] Migrating Auth Service..."
docker exec digi_keralam_20-auth_service-1 python manage.py makemigrations users
docker exec digi_keralam_20-auth_service-1 python manage.py migrate

echo "[2/6] Migrating Geography Service..."
docker exec digi_keralam_20-geo_service-1 python manage.py makemigrations locations
docker exec digi_keralam_20-geo_service-1 python manage.py migrate

echo "[3/6] Migrating Profile Service..."
docker exec digi_keralam_20-profile_service-1 python manage.py makemigrations profiles
docker exec digi_keralam_20-profile_service-1 python manage.py migrate

echo "[4/6] Migrating Session Service..."
docker exec digi_keralam_20-session_service-1 python manage.py makemigrations training_sessions
docker exec digi_keralam_20-session_service-1 python manage.py migrate

echo "[5/6] Migrating Attendance Service..."
docker exec digi_keralam_20-attendance_service-1 python manage.py makemigrations attendance
docker exec digi_keralam_20-attendance_service-1 python manage.py migrate

echo "[6/6] Migrating Analytics Service..."
docker exec digi_keralam_20-analytics_service-1 python manage.py makemigrations analytics
docker exec digi_keralam_20-analytics_service-1 python manage.py migrate

echo ">>> MIGRATION COMPLETE."
