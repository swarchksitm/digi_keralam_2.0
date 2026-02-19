
import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'legacy_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from training_sessions.models import TrainingSession, Attendance, SessionAssignment, Resource

User = get_user_model()

def reset_database():
    print("--- STARTING DATABASE CLEANUP ---")
    
    # 1. Clear Activity Data (Order matters for foreign keys)
    print("1. Deleting Attendance Records...")
    count, _ = Attendance.objects.all().delete()
    print(f"   - Deleted {count} records.")

    print("2. Deleting Session Assignments...")
    count, _ = SessionAssignment.objects.all().delete()
    print(f"   - Deleted {count} records.")

    print("3. Deleting Resources...")
    count, _ = Resource.objects.all().delete()
    print(f"   - Deleted {count} records.")

    print("4. Deleting Training Sessions...")
    count, _ = TrainingSession.objects.all().delete()
    print(f"   - Deleted {count} records.")

    # 2. Clear Users (Excluding Super Admins / State Admins)
    # Roles to keep: KSITM_SUPER_ADMIN, LSGD_STATE_ADMIN
    # Roles to delete: everything else
    print("5. Deleting Users (Trainers & Local Admins)...")
    
    users_to_delete = User.objects.exclude(
        role__in=[User.Role.KSITM_SUPER_ADMIN, User.Role.LSGD_STATE_ADMIN]
    ).exclude(is_superuser=True) # Safety net
    
    count, _ = users_to_delete.delete()
    print(f"   - Deleted {count} users.")

    print("--- CLEANUP COMPLETE ---")
    print("Remaining Users:")
    for u in User.objects.all():
        print(f" - {u.username} ({u.role})")

if __name__ == '__main__':
    reset_database()
