import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from training_sessions.models import Resource
from training_sessions.serializers import ResourceSerializer
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.get('/')

resources = Resource.objects.all()
if resources.exists():
    res = resources.first()
    print(f"DEBUG: Resource ID: {res.id}")
    print(f"DEBUG: File Path in DB: {res.file.name}")
    print(f"DEBUG: File URL property: {res.file.url}")
    
    # Test Serializer
    serializer = ResourceSerializer(res, context={'request': request})
    print(f"DEBUG: Serialized 'file': {serializer.data['file']}")
else:
    print("DEBUG: No resources found.")

print(f"DEBUG: MEDIA_URL setting: {settings.MEDIA_URL}")
print(f"DEBUG: MEDIA_ROOT setting: {settings.MEDIA_ROOT}")
