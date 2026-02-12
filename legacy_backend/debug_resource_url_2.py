import os
import django
from django.conf import settings

# Force DEBUG=True to avoid ALLOWED_HOSTS check in basic script if possible, 
# or just set ALLOWED_HOSTS
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# We need to configure settings before setup if we want to override, 
# but os.environ works for env vars.
# However, settings.py reads from .env.
# Let's just catch the error or inspect settings directly after setup.

try:
    django.setup()
except Exception as e:
    print(f"Setup warning: {e}")

from training_sessions.models import Resource
from training_sessions.serializers import ResourceSerializer
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

try:
    print(f"DEBUG: MEDIA_URL setting: '{settings.MEDIA_URL}'")
    print(f"DEBUG: MEDIA_ROOT setting: '{settings.MEDIA_ROOT}'")

    resources = Resource.objects.all()
    if resources.exists():
        res = resources.first()
        print(f"DEBUG: File Path in DB: {res.file.name}")
        print(f"DEBUG: File URL property: {res.file.url}")
    else:
        print("DEBUG: No resources found.")
except Exception as e:
    print(f"ERROR: {e}")
