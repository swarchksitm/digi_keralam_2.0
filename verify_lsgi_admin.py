
import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"
TOKEN_URL = f"{BASE_URL}/auth/token/"
LSGI_URL = f"{BASE_URL}/locations/lsgis/"

def verify_create_with_admin():
    try:
        # 1. Login to get token
        login_payload = {"username": "superadmin", "password": "admin123"}
        print(f"Logging in to {TOKEN_URL}...")
        resp = requests.post(TOKEN_URL, json=login_payload)
        if resp.status_code != 200:
            print(f"Login failed: {resp.status_code} {resp.text}")
            return
        
        token = resp.json()['access']
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        # 2. Create LSGI with Admin
        # Use existing district ID 1 (Thiruvananthapuram)
        payload = {
            "name": "Test LSGI Admin Prov",
            "lsgi_type": "GP",
            "district": 1,
            "block": None,
            "admin_username": "prov_admin_user",
            "admin_password": "securepassword123",
            "admin_phone": "9876543210"
        }
        
        print(f"Attempting to create LSGI with Admin credentials...")
        resp = requests.post(LSGI_URL, json=payload, headers=headers)
        
        if resp.status_code == 201:
            data = resp.json()
            print(f"Success: Created LSGI ID {data.get('id')} - {data.get('name')}")
            
            # 3. Verify Admin User was created (via login or checking profile if possible)
            # We can try to login as the new admin!
            print("Verifying new Admin login...")
            admin_login = {"username": "prov_admin_user", "password": "securepassword123"}
            resp_admin = requests.post(TOKEN_URL, json=admin_login)
            if resp_admin.status_code == 200:
                print("Success: New Admin logged in successfully!")
            else:
                print(f"Failed to login as new admin: {resp_admin.status_code}")

            # 4. Clean up (Delete LSGI)
            # Note: Deleting LSGI might not delete the User depending on cascade, but good to clean LSGI
            print("Cleaning up LSGI...")
            del_url = f"{LSGI_URL}{data['id']}/"
            requests.delete(del_url, headers=headers)
            print("Cleaned up LSGI record.")
            
        else:
            print(f"Failed to create: {resp.status_code} {resp.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify_create_with_admin()
