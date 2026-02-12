import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from training_sessions.models import TrainingSession
from training_sessions.serializers import TrainingSessionSerializer
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

User = get_user_model()
factory = APIRequestFactory()
request = factory.get('/')

# Find a district master trainer
dmt = User.objects.filter(role='DISTRICT_MASTER_TRAINER').first()

if not dmt:
    print("No District Master Trainer found in DB.")
    # Create one if needed? No, let's just abort.
else:
    print(f"DEBUG: Found DMT: {dmt.username}, ID: {dmt.id}, District: {dmt.profile.district}")
    request.user = dmt # Mock user

    # Simulate ViewSet get_queryset logic
    district = dmt.profile.district
    queryset = TrainingSession.objects.filter(ward__lsgi__district=district)
    print(f"DEBUG: ViewSet would return {queryset.count()} sessions.")

    count = 0
    for session in queryset:
        count += 1
        print(f"--- Session {session.id}: {session.title} ---")
        
        # Test Serializer for this session
        serializer = TrainingSessionSerializer(session, context={'request': request})
        data = serializer.data
        
        # Check 'ward' field structure
        ward_data = data.get('ward')
        print(f"    Serialized 'ward': {ward_data}")
        
        if ward_data:
            print(f"    Ward Name: {ward_data.get('name')}")
            lsgi_data = ward_data.get('lsgi')
            print(f"    LSGI Data: {lsgi_data}")
            if isinstance(lsgi_data, dict):
                 print(f"    LSGI Name: {lsgi_data.get('name')}")
            else:
                 print(f"    LSGI Data is NOT a dict! Type: {type(lsgi_data)}")

        if count >= 3:
            break
            
print("Done.")
