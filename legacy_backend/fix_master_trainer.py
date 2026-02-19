
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'legacy_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from locations.models import LSGI

User = get_user_model()

users_to_check = ['tvm_corp_admin_test', 'tvmcormaster1']

print("\n--- Comparing User Profiles ---")
admin_lsgi_id = None

for username in users_to_check:
    try:
        user = User.objects.get(username=username)
        print(f"\nUser: {user.username} (ID: {user.id})")
        print(f"Role: {user.role}")
        
        if hasattr(user, 'profile'):
            lsgi = user.profile.lsgi
            if lsgi:
                print(f"Assigned LSGI: {lsgi.name} (ID: {lsgi.id})")
                print(f"LSGI Type: {lsgi.lsgi_type}")
                print(f"District: {lsgi.district.name} (ID: {lsgi.district.id})")
                
                if username == 'tvm_corp_admin_test':
                    admin_lsgi_id = lsgi.id
                elif username == 'tvmcormaster1':
                    if admin_lsgi_id and lsgi.id != admin_lsgi_id:
                        print(f"!!! MISMATCH !!! Admin LSGI ID ({admin_lsgi_id}) != Trainer LSGI ID ({lsgi.id})")
                        print(f"Fixing Trainer LSGI to match Admin LSGI ({admin_lsgi_id})...")
                        
                        target_lsgi = LSGI.objects.get(id=admin_lsgi_id)
                        user.profile.lsgi = target_lsgi
                        user.profile.district = target_lsgi.district
                        user.profile.save()
                        print("Trainer profile updated to match Admin's LSGI.")
                    elif admin_lsgi_id and lsgi.id == admin_lsgi_id:
                        print("MATCH: Trainer is in the same LSGI as Admin.")
            else:
                print("LSGI: None (Missing!)")
                if username == 'tvmcormaster1' and admin_lsgi_id:
                    print(f"Fixing Trainer LSGI to match Admin LSGI ({admin_lsgi_id})...")
                    target_lsgi = LSGI.objects.get(id=admin_lsgi_id)
                    user.profile.lsgi = target_lsgi
                    user.profile.district = target_lsgi.district
                    user.profile.save()
                    print("Trainer profile updated to match Admin's LSGI.")
        else:
            print("Profile: None")
            
    except User.DoesNotExist:
        print(f"User {username} not found.")
