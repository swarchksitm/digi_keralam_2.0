
import os
import django
import sys
from django.db.models import Count

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'legacy_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from locations.models import LSGI
from django.contrib.auth import get_user_model

User = get_user_model()

lsgis = LSGI.objects.filter(district__name__icontains='Thiruvananthapuram', lsgi_type='CORPORATION')
for l in lsgis:
    user_count = l.userprofile_set.count()
    print(f"ID:{l.id} Users:{user_count} Name:{l.name[:20]}...")

print("--- Users ---")
users_to_check = ['tvm_corp_admin_test', 'tvmcormaster1']
for username in users_to_check:
    try:
        user = User.objects.get(username=username)
        lid = user.profile.lsgi.id if user.profile.lsgi else "None"
        print(f"User:{username} LSGI_ID:{lid}")
    except:
        print(f"User:{username} Not Found")
