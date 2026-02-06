import urllib.request
import json
from django.conf import settings
from rest_framework.exceptions import APIException

class ServiceClientError(APIException):
    status_code = 503
    default_detail = 'Service unavailable'
    default_code = 'service_unavailable'

class ProfileClient:
    BASE_URL = "http://profile_service:8000/api/profiles"

    @staticmethod
    def get_profile(token):
        try:
            url = f"{ProfileClient.BASE_URL}/me/"
            req = urllib.request.Request(url)
            req.add_header('Authorization', f'Bearer {token}')
            
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    print(f"Profile Data: {data}")
                    return data
            return None
        except Exception as e:
            print(f"ProfileClient Error: {e}")
            return None

class GeoClient:
    BASE_URL = "http://geo_service:8000/api/geography"

    @staticmethod
    def get_wards_in_district(district_id):
        try:
            url = f"{GeoClient.BASE_URL}/wards/?lsgi__district={district_id}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=5) as response:
                 if response.status == 200:
                     data = json.loads(response.read().decode())
                     return [w['id'] for w in data]
            return []
        except Exception as e:
             # Try alternative endpoint if needed or log error
             print(f"GeoClient Error: {e}")
             return []
            
    @staticmethod
    def get_wards_in_lsgi(lsgi_id):
        try:
            url = f"{GeoClient.BASE_URL}/wards/?lsgi={lsgi_id}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=5) as response:
                 if response.status == 200:
                     data = json.loads(response.read().decode())
                     return [w['id'] for w in data]
            return []
        except Exception as e:
             print(f"GeoClient Error: {e}")
             return []
