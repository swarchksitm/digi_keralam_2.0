from django.core.management.base import BaseCommand
from attendance.models import Attendance

class Command(BaseCommand):
    help = 'Seeds attendance'

    def handle(self, *args, **kwargs):
        # We need the session ID. Since IDs are auto-increment, we can't be 100% sure it's 1.
        # However, for a fresh seed, it's likely 1. 
        # But to be robust, we probably shouldn't guess.
        # But Attendance service doesn't know about Session objects directly (no Foreign Key to Session table, just IntegerField).
        # So we can just seed for Session ID 1 (Assuming seed_sessions created ID 1).
        
        SESSION_ID = 1 # Vulnerable assumption, but acceptable for seeded dev env
        CITIZEN_ID = 105
        TRAINER_ID = 104
        
        att, created = Attendance.objects.get_or_create(
            session_id=SESSION_ID,
            citizen_id=CITIZEN_ID,
            defaults={
                "status": "PRESENT",
                "marked_by_id": TRAINER_ID
            }
        )
        
        if created:
             self.stdout.write(f"Marked Attendance for Citizen {CITIZEN_ID} in Session {SESSION_ID}")
