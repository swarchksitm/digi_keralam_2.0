from django.core.management.base import BaseCommand
from profiles.models import UserProfile
from django.contrib.auth import get_user_model
from django.db import transaction

class Command(BaseCommand):
    help = 'Seeds user profiles with geography'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        
        # User Mapping (Must match seed_users.py)
        # 101: KSITM State Admin -> No Geo (or State level?) - Our Model binds to specific level nulls
        # 102: TVM District Admin -> District=1 (TVM)
        # 103: TVM Master Trainer -> District=1 (TVM)
        # 104: TVM Field Trainer -> Ward=1 (TVM Corp -> Ward 1)
        # 105-107: Citizens -> Ward=1
        
        profiles = [
            (101, {}),
            (102, {'district_id': 1}),
            (103, {'district_id': 1}),
            (104, {'ward_id': 1}),
            (105, {'ward_id': 1}),
            (106, {'ward_id': 1}),
            (107, {'ward_id': 1}),
        ]

        # Since Profile Service doesn't rely on Auth DB, we must create Stub Users first
        # But wait, Profile Service has its OWN User model (a replica/stub).
        # We need to ensure those exist.
        
        for uid, geo_data in profiles:
            # 1. Ensure Stub User Exists
            if not User.objects.filter(id=uid).exists():
                User.objects.create(id=uid, username=f"user_{uid}", password="stub")
                self.stdout.write(f"Created Stub User {uid}")
            
            user_stub = User.objects.get(id=uid)
            
            # 2. Create Profile
            if not UserProfile.objects.filter(user=user_stub).exists():
                UserProfile.objects.create(user=user_stub, **geo_data)
                self.stdout.write(f"Created Profile for User {uid} with {geo_data}")
            else:
                self.stdout.write(f"Profile for User {uid} exists")
