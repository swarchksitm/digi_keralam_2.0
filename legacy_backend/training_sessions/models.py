from django.db import models
from django.conf import settings
from locations.models import Ward
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
    ward = models.ForeignKey(Ward, on_delete=models.CASCADE, related_name='training_sessions', help_text="Strict Ward Anchor", null=True, blank=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    proficiency = models.CharField(max_length=20, choices=Proficiency.choices)
    mode = models.CharField(max_length=10, choices=Mode.choices, default=Mode.OFFLINE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    
    date_time = models.DateTimeField()
    venue = models.CharField(max_length=255, blank=True, help_text="Physical location if offline")
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.PROTECT, 
        related_name='created_sessions',
        limit_choices_to={'role': 'DISTRICT_MASTER_TRAINER'}
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        ward_name = self.ward.name if self.ward else 'No Ward'
        return f"{self.title} ({ward_name})"

class SessionAssignment(models.Model):
    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='assignments')
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='assigned_sessions',
        limit_choices_to={'role': 'LSGI_FIELD_TRAINER'}
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'trainer')

    def clean(self):
        # Validation: Trainer's Ward (via Profile) must match Session's Ward
        # Or at least be in the same LSGI if we allow cross-ward assignment within LSGI
        if not hasattr(self.trainer, 'profile'):
             raise ValidationError("Trainer has no profile.")
        
        if not self.session.ward:
             return # Allow if session has no ward yet? Or strict?

        trainer_wards = self.trainer.profile.wards.all()
        if not trainer_wards.filter(id=self.session.ward.id).exists():
             raise ValidationError(f"Trainer is not assigned to Ward {self.session.ward.name}.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', _('Present')
        ABSENT = 'ABSENT', _('Absent')

    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='attendances')
    citizen = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='session_attendances',
        limit_choices_to={'role': 'CITIZEN'}
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PRESENT)
    marked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'citizen')

class Resource(models.Model):
    class ResourceType(models.TextChoices):
        PDF = 'PDF', _('PDF Document')
        VIDEO = 'VIDEO', _('Video')
        Presentation = 'PPT', _('Presentation')
        Spreadsheet = 'XLS', _('Spreadsheet')
        OTHER = 'OTHER', _('Other')

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='resources/', blank=True, null=True)
    external_url = models.URLField(blank=True, null=True, help_text="Link if not uploading file")
    
    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name='resources', null=True, blank=True)
    
    resource_type = models.CharField(max_length=10, choices=ResourceType.choices, default=ResourceType.PDF)
    
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_resources'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
