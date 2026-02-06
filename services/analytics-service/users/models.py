from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Role(models.TextChoices):
        # Admin Roles (Governance)
        KSITM_SUPER_ADMIN = 'KSITM_SUPER_ADMIN', _('KSITM Super Admin')
        LSGD_STATE_ADMIN = 'LSGD_STATE_ADMIN', _('LSGD State Admin')
        LSGD_DISTRICT_ADMIN = 'LSGD_DISTRICT_ADMIN', _('LSGD District Admin')
        LSGD_BLOCK_ADMIN = 'LSGD_BLOCK_ADMIN', _('LSGD Block/Assembly Admin')
        LSGI_ADMIN = 'LSGI_ADMIN', _('LSGI Admin')
        
        # Trainer Roles (Delivery)
        STATE_SUPER_TRAINER = 'STATE_SUPER_TRAINER', _('State Level Super Trainer')
        DISTRICT_MASTER_TRAINER = 'DISTRICT_MASTER_TRAINER', _('District Level Master Trainer')
        BLOCK_TRAINER = 'BLOCK_TRAINER', _('Block/Assembly Level Trainer')
        LSGI_FIELD_TRAINER = 'LSGI_FIELD_TRAINER', _('LSGI Field Level Trainer')
        
        # End User
        CITIZEN = 'CITIZEN', _('Citizen')

    role = models.CharField(
        max_length=50,
        choices=Role.choices,
        default=Role.CITIZEN,
        help_text=_("User role for RBAC")
    )
    phone = models.CharField(
        max_length=15, 
        unique=True, 
        help_text=_("Phone number used for OTP authentication"),
        null=True,
        blank=True
    )
    is_verified = models.BooleanField(
        default=False, 
        help_text=_("Verification status for trainers")
    )

    def save(self, *args, **kwargs):
        # Auto-verify admins and citizens
        if self.role in [
            self.Role.CITIZEN, 
            self.Role.KSITM_SUPER_ADMIN, 
            self.Role.LSGD_STATE_ADMIN,
            self.Role.LSGD_DISTRICT_ADMIN,
            self.Role.LSGD_BLOCK_ADMIN,
            self.Role.LSGI_ADMIN
        ]:
            self.is_verified = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"
