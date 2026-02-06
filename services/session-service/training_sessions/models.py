from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError

class TrainingSession(models.Model):
    class Category(models.TextChoices):
        SAFE_TECH = 'SAFE_TECH', _('Safe Tech')
        AI_EDU = 'AI_EDU', _('AI Education')
        DEED = 'DEED', _('DEED')

    class Proficiency(models.TextChoices):
        BEGINNER = 'BEGINNER', _('Beginner')
        INTERMEDIATE = 'INTERMEDIATE', _('Intermediate')
        ADVANCED = 'ADVANCED', _('Advanced')

    class Mode(models.TextChoices):
        OFFLINE = 'OFFLINE', _('Offline')
        ONLINE = 'ONLINE', _('Online')

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Decoupled Geography - Stored as ID
    ward_id = models.IntegerField(db_column='ward_id', help_text="Ward ID (Geo Service)")
    
    category = models.CharField(max_length=20, choices=Category.choices)
    proficiency = models.CharField(max_length=20, choices=Proficiency.choices)
    mode = models.CharField(max_length=10, choices=Mode.choices, default=Mode.OFFLINE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    
    date_time = models.DateTimeField()
    venue = models.CharField(max_length=255, blank=True, help_text="Physical location if offline")
    
    # Decoupled User - Stored as ID
    created_by_id = models.IntegerField(db_column='created_by_id', help_text="User ID (Auth Service)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} (Ward {self.ward_id})"

class SessionAssignment(models.Model):
    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='assignments')
    
    # Decoupled Trainer - Stored as ID
    trainer_id = models.IntegerField(db_column='trainer_id', help_text="Trainer User ID")
    
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'trainer_id')

    def check_conflicts(self):
        # Placeholder for API-based validation
        pass

