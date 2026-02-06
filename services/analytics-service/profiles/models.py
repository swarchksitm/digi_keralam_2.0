from django.db import models
from django.conf import settings
from locations.models import District, Block, LSGI, Ward
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    
    # Geographic Bindings (Strictly one level or hierarchical? 
    # Usually a lower level implies higher levels, but storing the specific assignment is key)
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True)
    block = models.ForeignKey(Block, on_delete=models.SET_NULL, null=True, blank=True)
    lsgi = models.ForeignKey(LSGI, on_delete=models.SET_NULL, null=True, blank=True)
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        # Strict geography validation rules based on Role
        role = self.user.role
        UserRole = self.user.__class__.Role # Access Role enum

        if role == UserRole.LSGD_DISTRICT_ADMIN or role == UserRole.DISTRICT_MASTER_TRAINER:
            if not self.district:
                raise ValidationError("District assignment is required for this role.")
            if self.block or self.lsgi or self.ward:
                raise ValidationError("District-level roles cannot be bound to lower geographies.")

        # Add more rules as needed (Block, LSGI, Ward levels)

    def __str__(self):
        return f"Profile: {self.user.username} ({self.user.role})"
