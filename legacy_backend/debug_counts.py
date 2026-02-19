import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db.models import Q
from locations.models import LSGI, Ward

total_lsgis = LSGI.objects.count()
total_wards = Ward.objects.count()
empty_lsgis = []
for lsgi in LSGI.objects.all():
    if lsgi.wards.count() == 0:
        empty_lsgis.append(lsgi)

print(f"Total LSGIs: {total_lsgis}")
print(f"Total Wards: {total_wards}")
print(f"LSGIs with 0 wards: {len(empty_lsgis)}")

if len(empty_lsgis) > 0:
    print("Empty LSGIs:")
    for l in empty_lsgis:
        print(f"- {l.name} ({l.district.name})")

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
