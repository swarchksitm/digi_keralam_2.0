
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from locations.models import District, Block, LSGI, Ward

print(f"Districts: {District.objects.count()}")
print(f"Blocks: {Block.objects.count()}")
print(f"LSGIs: {LSGI.objects.count()}")
print(f"Wards: {Ward.objects.count()}")

# Check for some specific data if possible, or just raw counts
if LSGI.objects.filter(code__isnull=False).exists():
    print(f"LSGIs with LBCode: {LSGI.objects.filter(code__isnull=False).count()}")
