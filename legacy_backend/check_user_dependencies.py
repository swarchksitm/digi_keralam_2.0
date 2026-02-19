
import os
import django
import sys
from django.db.models import Count

# Setup Django environment
sys.path.append(os.path.join(os.getcwd(), 'legacy_backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from training_sessions.models import TrainingSession, SessionAssignment, Attendance, Resource

User = get_user_model()
try:
    user = User.objects.get(id=9)
    print(f"User: {user} (ID: {user.id}, Role: {user.role})")
    
    # Check sessions created by this user
    created = TrainingSession.objects.filter(created_by=user).count()
    print(f"Sessions Created: {created}")
    
    if created > 0:
        print("ALERT: Deletion prevented by created_by=PROTECT")
    
    # Check sessions assigned to this user
    assigned = SessionAssignment.objects.filter(trainer=user).count()
    print(f"Sessions Assigned: {assigned}")
    
    # Check attendance
    attended = Attendance.objects.filter(citizen=user).count()
    print(f"Attendance Records: {attended}")
    
    # Check resources uploaded by this user
    uploaded = Resource.objects.filter(uploaded_by=user).count()
    print(f"Resources Uploaded: {uploaded}")

except User.DoesNotExist:
    print("User ID 9 not found.")
