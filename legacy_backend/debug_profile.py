import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
dmt = User.objects.filter(role='DISTRICT_MASTER_TRAINER').first()
if dmt:
    print(f"User: {dmt.username}")
    print(f"Profile District: {dmt.profile.district}")
    print(f"Profile LSGI: {dmt.profile.lsgi}")
