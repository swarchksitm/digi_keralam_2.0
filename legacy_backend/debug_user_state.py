import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from locations.models import District

User = get_user_model()

with open('debug_output.txt', 'w') as f:
    f.write("-" * 50 + "\n")
    f.write("DEBUGGING USER STATE\n")
    f.write("-" * 50 + "\n")

    try:
        # Check LSGI Field Trainers
        f.write("\nCHECKING TRAINERS\n")
        trainers = User.objects.filter(role=User.Role.LSGI_FIELD_TRAINER)
        if not trainers.exists():
            f.write("NO LSGI Field Trainers found in the system!\n")
        
        for t in trainers:
            f.write(f"Trainer: {t.username} (ID: {t.id})\n")
            if hasattr(t, 'profile'):
                p = t.profile
                lsgi_name = p.lsgi.name if p.lsgi else "None"
                lsgi_dist = p.lsgi.district.name if p.lsgi else "None"
                
                dist_name = p.district.name if p.district else "None"
                
                f.write(f"  LSGI: {lsgi_name} (Dist: {lsgi_dist})\n")
                f.write(f"  Profile District: {dist_name}\n")
                
                # Check for mismatch or missing district
                if p.lsgi and not p.district:
                    f.write("  Status: BROKEN - Missing District! Auto-fixing...\n")
                    p.district = p.lsgi.district
                    p.save()
                    f.write("  Status: FIXED.\n")
                elif p.lsgi and p.district != p.lsgi.district:
                    f.write("  Status: BROKEN - District Mismatch! Auto-fixing...\n")
                    p.district = p.lsgi.district
                    p.save()
                    f.write("  Status: FIXED.\n")
                else:
                    f.write("  Status: OK\n")
            else:
                f.write("  Status: BROKEN - No Profile!\n")
                
    except Exception as e:
        f.write(f"Error during debug: {e}\n")

    f.write("-" * 50 + "\n")
