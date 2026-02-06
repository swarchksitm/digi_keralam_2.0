from django.core.management.base import BaseCommand
from training_sessions.models import TrainingSession, SessionAssignment
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seeds initial training sessions'

    def handle(self, *args, **kwargs):
        # Master Trainer ID: 103
        # Field Trainer ID: 104
        # Ward: 1 (TVM Ward 1)
        
        MASTER_ID = 103
        FIELD_ID = 104
        WARD_ID = 1
        
        # 1. Create Session
        session, created = TrainingSession.objects.get_or_create(
            title="TVM Digital Campaign Phase 1",
            ward_id=WARD_ID,
            defaults={
                "description": "Intro to AI for Citizens",
                "category": "AI_EDU",
                "proficiency": "BEGINNER",
                "mode": "OFFLINE",
                "date_time": timezone.now() + timedelta(days=5),
                "created_by_id": MASTER_ID,
                "status": "SCHEDULED"
            }
        )
        if created:
            self.stdout.write(f"Created Session: {session.title} (ID: {session.id})")
        else:
            self.stdout.write(f"Session {session.id} exists")

        # 2. Assign Field Trainer
        assign, created = SessionAssignment.objects.get_or_create(
            session=session,
            trainer_id=FIELD_ID,
            defaults={
                "assigned_at": timezone.now()
            }
        )
        if created:
            self.stdout.write(f"Assigned Trainer {FIELD_ID} to Session {session.id}")
