import requests
import json

try:
    # Login to get token first if needed, but Resources might be protected.
    # Actually, let's try a public file check or assume we have credentials if needed.
    # Or just use the viewset permissions. Resources are IsAuthenticated.
    
    # Let's try to just hit the media URL directly to see if 404.
    url_bad = 'http://localhost:8000/resources/Digikeralam_2.0.docx'
    r_bad = requests.head(url_bad)
    print(f"HEAD {url_bad}: {r_bad.status_code}")

    url_good = 'http://localhost:8000/media/resources/Digikeralam_2.0.docx'
    r_good = requests.head(url_good)
    print(f"HEAD {url_good}: {r_good.status_code}")

    # Now let's try to get the API response for resources to see what JSON it sends.
    # We need a token.
    login_url = 'http://localhost:8000/api/auth/login/'
    # Using a known user
    creds = {'username': 'tvmcormaster1', 'password': 'password123'}
    try:
        r_login = requests.post(login_url, json=creds)
        if r_login.status_code == 200:
            token = r_login.json().get('access')
            sys_headers = {'Authorization': f'Bearer {token}'}
            
            # Fetch /api/training/resources/
            # Or /api/training/sessions/ since we saw it in Session list
            r_res = requests.get('http://localhost:8000/api/training/resources/', headers=sys_headers)
            print(f"API Resources Status: {r_res.status_code}")
            if r_res.status_code == 200:
                data = r_res.json()
                if isinstance(data, list) and len(data) > 0:
                     print(f"API returned URL: {data[0].get('file')}")
                else:
                    print("API returned empty list or unexpected format")
        else:
            print(f"Login failed: {r_login.status_code} {r_login.text}")

    except Exception as e:
        print(f"API fetch failed: {e}")

except Exception as e:
    print(f"Error: {e}")
