import requests
import json
import sys
import argparse
import base64
import time

BASE_URL = "http://localhost:8080"

def get_token(username, password="password123"):
    url = f"{BASE_URL}/api/auth/login/"
    try:
        resp = requests.post(url, json={"username": username, "password": password}, timeout=5)
        if resp.status_code == 200:
            return resp.json()["access"]
    except Exception as e:
        print(f"Auth Exception: {e}")
    return None

def run_test(scenario):
    print(f"--- Running Scenario: {scenario} ---")
    
    # Authenticate
    if scenario == "invalid_jwt":
        print("Using Invalid Tokens...")
        master_token = "invalid.token.string"
        field_token = "invalid.token.string"
        admin_token = "invalid.token.string"
    else:
        master_token = get_token("master_trainer")
        field_token = get_token("field_trainer")
        admin_token = get_token("state_admin")
        
        if not master_token and scenario != "auth_down":
            print("CRITICAL: Failed to get Master Token. Aborting.")
            sys.exit(1)

    headers = {"Authorization": f"Bearer {master_token}"}
    
    # 1. Create Session
    print("\n[Step 1] Create Session")
    session_data = {
        "title": f"Resilience Test Session {int(time.time())}",
        "description": "Testing Failure Modes",
        "ward_id": 1, 
        "category": "SAFE_TECH",
        "proficiency": "BEGINNER",
        "mode": "OFFLINE",
        "date_time": "2026-04-01T10:00:00Z"
    }
    session_id = None
    try:
        resp = requests.post(f"{BASE_URL}/api/sessions/", json=session_data, headers=headers, timeout=5)
        print(f"Response: {resp.status_code}")
        if resp.status_code == 201:
            session_id = resp.json().get("id")
            print(f"PASS: Session Created ID {session_id}")
        elif resp.status_code in [401, 403]:
            print("AUTH FAIL (Expected for invalid_jwt)")
        else:
            print(f"FAIL: {resp.text}")
    except Exception as e:
        print(f"EXCEPTION: {e}")

    if not session_id and scenario != "invalid_jwt":
        print("Skipping dependent steps due to Session Creation failure.")
        return

    # 2. Assign Trainer
    print("\n[Step 2] Assign Trainer")
    assign_data = {"session": session_id, "trainer_id": 6}
    try:
        resp = requests.post(f"{BASE_URL}/api/assignments/", json=assign_data, headers=headers, timeout=5)
        print(f"Response: {resp.status_code}")
        if resp.status_code == 201:
            print("PASS: Assignment Successful")
        else:
            print(f"FAIL: {resp.text}")
    except Exception as e:
        print(f"EXCEPTION: {e}")

    # 3. Mark Attendance
    print("\n[Step 3] Mark Attendance")
    f_headers = {"Authorization": f"Bearer {field_token}"}
    attend_data = {"session": session_id,"citizen_id": 7,"status": "PRESENT"}
    try:
        resp = requests.post(f"{BASE_URL}/api/attendance/{session_id}/", json=attend_data, headers=f_headers, timeout=5)
        print(f"Response: {resp.status_code}")
        if resp.status_code in [200, 201]:
            print("PASS: Attendance Marked")
        elif scenario == "attendance_down" and resp.status_code in [502, 504, 503]:
            print("PASS (Expected): Attendance Service Unavailable")
        elif scenario == "invalid_jwt" and resp.status_code in [401, 403]:
             print("PASS (Expected): Auth Rejected")
        else:
            print(f"FAIL: Expected Success (or specific error), got {resp.status_code}")
    except Exception as e:
        print(f"EXCEPTION: {e}")

    # 4. Check Analytics
    print("\n[Step 4] Check Analytics")
    a_headers = {"Authorization": f"Bearer {admin_token}"}
    try:
        resp = requests.get(f"{BASE_URL}/api/analytics/summary/", headers=a_headers, timeout=5)
        print(f"Response: {resp.status_code}")
        if resp.status_code == 200:
             print("PASS: Analytics returned")
        elif scenario == "analytics_down" and resp.status_code in [502, 504, 503]:
             print("PASS (Expected): Analytics Service Unavailable")
        elif scenario == "invalid_jwt" and resp.status_code in [401, 403]:
             print("PASS (Expected): Auth Rejected")
        else:
             print(f"FAIL: {resp.status_code}")
    except Exception as e:
         print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--scenario", default="standard", help="Test Scenario (analytics_down, attendance_down, invalid_jwt)")
    args = parser.parse_args()
    run_test(args.scenario)
