
import os
import django
import sys
from django.db import transaction

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'legacy_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from locations.models import LSGI, Ward
from training_sessions.models import TrainingSession
from django.contrib.auth import get_user_model

User = get_user_model()

OLD_LSGI_ID = 2363
NEW_LSGI_ID = 1343

def migrate():
    try:
        with transaction.atomic():
            old_lsgi = LSGI.objects.get(id=OLD_LSGI_ID)
            new_lsgi = LSGI.objects.get(id=NEW_LSGI_ID)
            
            print(f"Migrating from '{old_lsgi.name}' ({old_lsgi.id}) to '{new_lsgi.name}' ({new_lsgi.id})")
            
            # 1. Migrate Users (Direct LSGI link)
            users = User.objects.filter(profile__lsgi=old_lsgi)
            print(f"Found {users.count()} users to migrate.")
            for user in users:
                user.profile.lsgi = new_lsgi
                user.profile.district = new_lsgi.district
                user.profile.save()
                print(f"  - Migrated user: {user.username}")
                
            # 2. Migrate Wards and Sessions
            old_wards = Ward.objects.filter(lsgi=old_lsgi)
            print(f"Found {old_wards.count()} old wards.")
            
            for old_ward in old_wards:
                # Find matching new ward
                new_ward = Ward.objects.filter(lsgi=new_lsgi, number=old_ward.number).first()
                
                if new_ward:
                    # Move Sessions
                    sessions = TrainingSession.objects.filter(ward=old_ward)
                    if sessions.exists():
                        print(f"  - Moving {sessions.count()} sessions from Ward {old_ward.number} (Old) to Ward {new_ward.number} (New)")
                        sessions.update(ward=new_ward)
                    
                    # Move User Profile M2M Wards
                    # Find users who have this old_ward in their 'wards' M2M
                    # Note: We can't query M2M easily directly on Ward side without related_name if not defined, 
                    # but UserProfile has 'wards'. 
                    # Actually, UserProfile has `wards = models.ManyToManyField(Ward, ...)`
                    # So Ward has `userprofile_set` (auto-generated) or similar.
                    # Let's check UserProfile model... assume it's `userprofile_set`
                    
                    
                    # Move User Profile M2M Wards (assigned_trainers)
                    profiles = old_ward.assigned_trainers.all()
                    for profile in profiles:
                        print(f"    - Updating assigned ward for user: {profile.user.username}")
                        profile.wards.remove(old_ward)
                        profile.wards.add(new_ward)
                        
                    # Move User Profile Residential Ward (residents)
                    residents = old_ward.residents.all()
                    for profile in residents:
                        print(f"    - Updating residential ward for user: {profile.user.username}")
                        profile.ward = new_ward
                        profile.save()
                        
                else:
                    print(f"  WARNING: No matching new ward found for Old Ward {old_ward.number} ({old_ward.name})")

            print("Migration successful. Deleting old LSGI...")
            old_lsgi.delete()
            print("Old LSGI deleted.")

    except LSGI.DoesNotExist:
        print("One of the LSGIs does not exist.")
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == '__main__':
    migrate()
