import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from training_sessions.models import TrainingSession, Attendance
from locations.models import District

User = get_user_model()

def check_analytics():
    print("--- Debugging Analytics ---")
    
    # 1. Get Master Trainers
    mts = User.objects.filter(role='DISTRICT_MASTER_TRAINER')
    print(f"Found {mts.count()} Master Trainers")
    
    for mt in mts:
        print(f"\nMaster Trainer: {mt.username} (ID: {mt.id})")
        if not hasattr(mt, 'profile') or not mt.profile.district:
            print("  - No Profile or District assigned!")
            continue
            
        district = mt.profile.district
        print(f"  - District: {district.name} (ID: {district.id})")
        
        # 2. Check Sessions logic (from views.py)
        # sessions = sessions.filter(ward__lsgi__district=user.profile.district)
        
        all_sessions = TrainingSession.objects.all()
        filtered_sessions = all_sessions.filter(ward__lsgi__district=district)
        
        print(f"  - Total Sessions in DB: {all_sessions.count()}")
        print(f"  - Sessions matching District filter: {filtered_sessions.count()}")
        
        if filtered_sessions.count() == 0:
            print("    -> No sessions match the filter. Checking why...")
            # Check sessions created by this user
            created_sessions = TrainingSession.objects.filter(created_by=mt)
            print(f"    - Sessions created by this MT: {created_sessions.count()}")
            
            for s in created_sessions:
                ward_info = "None"
                if s.ward:
                    ward_info = f"{s.ward.name} (LSGI: {s.ward.lsgi.name}, Dist: {s.ward.lsgi.district.name})"
                print(f"      - Session {s.id}: Ward={ward_info}")
                
        # 3. Check Attendees
        total_attendees = Attendance.objects.filter(session__in=filtered_sessions, status='PRESENT').count()
        print(f"  - Total Attendees (Counted): {total_attendees}")
        
        # Check if there are ANY attendees for created sessions
        if filtered_sessions.count() == 0:
             created_sessions = TrainingSession.objects.filter(created_by=mt)
             attendees_created = Attendance.objects.filter(session__in=created_sessions).count()
             print(f"    - Attendees in sessions created by MT (ignoring filter): {attendees_created}")

if __name__ == '__main__':
    check_analytics()
