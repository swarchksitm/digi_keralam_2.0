
import requests

try:
    # First get an LSGI ID
    lsgi_resp = requests.get('http://localhost:8000/api/locations/lsgis/')
    if lsgi_resp.status_code == 200:
        lsgis = lsgi_resp.json()
        if lsgis:
            lsgi_id = lsgis[0]['id']
            print(f"Testing with LSGI ID: {lsgi_id}")
            
            # Now get wards for this LSGI
            ward_resp = requests.get(f'http://localhost:8000/api/locations/wards/?lsgi={lsgi_id}')
            print(f"Ward Response Status: {ward_resp.status_code}")
            wards = ward_resp.json()
            print(f"Ward Count: {len(wards)}")
            if len(wards) > 0:
                print(f"First Ward: {wards[0]}")
        else:
            print("No LSGIs found")
    else:
        print(f"LSGI Response Status: {lsgi_resp.status_code}")
        print(lsgi_resp.text)

except Exception as e:
    print(f"Error: {e}")
