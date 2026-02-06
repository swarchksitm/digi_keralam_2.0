#!/bin/bash
set -e

echo ">>> PHASE 1: SEEDING DATA (Strict Dependency Order)"

echo "[1/5] Seeding Geography..."
docker exec digi_keralam_20-geo_service-1 python manage.py seed_geography

echo "[2/5] Seeding Users (Auth)..."
docker exec digi_keralam_20-auth_service-1 python manage.py seed_users

echo "[3/5] Seeding Profiles..."
docker exec digi_keralam_20-profile_service-1 python manage.py seed_profiles

echo "[4/5] Seeding Scenarios (Sessions)..."
docker exec digi_keralam_20-session_service-1 python manage.py seed_sessions

echo "[5/5] Seeding Scenarios (Attendance)..."
docker exec digi_keralam_20-attendance_service-1 python manage.py seed_attendance

echo ">>> SEEDING COMPLETE."
