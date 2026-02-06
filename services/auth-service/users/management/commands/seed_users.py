from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Seeds initial users'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        
        # Define users with fixed IDs to ensure profile binding consistency
        # Role: (Username, ID, Phone)
        users = [
            ('ksitm_admin', 101, 'KSITM_SUPER_ADMIN', '9400000101'), # State Admin
            ('tvm_admin', 102, 'LSGD_DISTRICT_ADMIN', '9400000102'), # District Admin (TVM)
            ('tvm_master', 103, 'DISTRICT_MASTER_TRAINER', '9400000103'), # Master Trainer (TVM)
            ('tvm_field', 104, 'LSGI_FIELD_TRAINER', '9400000104'), # Field Trainer (TVM Ward 1)
            ('citizen_1', 105, 'CITIZEN', '9400000105'), # Citizen 1
            ('citizen_2', 106, 'CITIZEN', '9400000106'), # Citizen 2
            ('citizen_3', 107, 'CITIZEN', '9400000107'), # Citizen 3
        ]

        for username, uid, role, phone in users:
            if not User.objects.filter(id=uid).exists():
                User.objects.create_user(
                    id=uid,
                    username=username,
                    password='password123',
                    role=role,
                    phone=phone,
                    is_active=True,
                    is_verified=True
                )
                self.stdout.write(f'Created User: {username} ({role})')
            else:
                self.stdout.write(f'User {username} already exists')
