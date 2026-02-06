import urllib.request
import json
from django.conf import settings
from rest_framework.exceptions import APIException

class ServiceClientError(APIException):
    status_code = 503
    default_detail = 'Service unavailable'
    default_code = 'service_unavailable'

class SessionClient:
    BASE_URL = "http://session_service:8000/api/sessions"

    @staticmethod
    def get_session(session_id, token):
        try:
            url = f"{SessionClient.BASE_URL}/{session_id}/"
            req = urllib.request.Request(url)
            req.add_header('Authorization', f'Bearer {token}')
            
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    return json.loads(response.read().decode())
            return None
        except Exception as e:
            print(f"SessionClient Error: {e}")
            return None

    @staticmethod
    def check_assignment(session_id, trainer_id, token):
        # Determine if trainer is assigned.
        # Session Service should expose an endpoint or we check session['assignments']?
        # Let's assume GET session returns assignments or we can query assignments endpoint.
        # GET /api/sessions/assignments/?session={id}&trainer={id}
        try:
            url = f"http://session_service:8000/api/assignments/?session={session_id}&trainer={trainer_id}"
            req = urllib.request.Request(url)
            req.add_header('Authorization', f'Bearer {token}')
            
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode())
                    return len(data) > 0
            return False
        except Exception as e:
            print(f"SessionAssignment Check Error: {e}")
            return False
