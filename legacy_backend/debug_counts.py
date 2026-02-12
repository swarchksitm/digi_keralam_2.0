import os
import django
from django.conf import settings
from django.db.models import Q

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from training_sessions.models import TrainingSession

User = get_user_model()

dmt = User.objects.filter(role='DISTRICT_MASTER_TRAINER').first()
if dmt:
    print(f"Checking for user: {dmt.username}")
    
    # Check sessions created by dmt
    created_count = TrainingSession.objects.filter(created_by=dmt).count()
    print(f"Sessions created by {dmt.username}: {created_count}")
    
    # Check sessions in district
    district = dmt.profile.district
    district_count = TrainingSession.objects.filter(ward__lsgi__district=district).count()
    print(f"Sessions in district {district}: {district_count}")
    
    # Combined query
    total = TrainingSession.objects.filter(
        Q(ward__lsgi__district=district) | Q(created_by=dmt)
    ).distinct().count()
    print(f"Total visible sessions with new logic: {total}")
else:
    print("No DMT user found.")
