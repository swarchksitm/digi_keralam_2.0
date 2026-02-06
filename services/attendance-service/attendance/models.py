from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', _('Present')
        ABSENT = 'ABSENT', _('Absent')

    session_id = models.IntegerField(help_text="ID from Session Service")
    citizen_id = models.IntegerField(help_text="ID from Auth Service")
    
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PRESENT)
    marked_at = models.DateTimeField(auto_now_add=True)
    marked_by_id = models.IntegerField(null=True, help_text="Trainer ID who marked attendance")

    class Meta:
        unique_together = ('session_id', 'citizen_id')
        indexes = [
            models.Index(fields=['session_id']),
            models.Index(fields=['citizen_id']),
        ]

    def __str__(self):
        return f"Session {self.session_id} - Citizen {self.citizen_id}: {self.status}"
