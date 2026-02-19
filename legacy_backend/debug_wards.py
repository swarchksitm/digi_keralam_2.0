
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from locations.models import LSGI, Ward, District

print(f"Total LSGIs: {LSGI.objects.count()}")
print(f"Total Wards: {Ward.objects.count()}")

lsgis = LSGI.objects.all()[:5]
for lsgi in lsgis:
    ward_count = Ward.objects.filter(lsgi=lsgi).count()
    print(f"LSGI: {lsgi.name} ({lsgi.id}) - Wards: {ward_count}")

# Check for a specific district if known, e.g. Thiruvananthapuram
tvm = District.objects.filter(name__icontains='Thiruvananthapuram').first()
if tvm:
    print(f"\nChecking Thiruvananthapuram LSGIs:")
    tvm_lsgis = LSGI.objects.filter(district=tvm)[:5]
    for lsgi in tvm_lsgis:
        ward_count = Ward.objects.filter(lsgi=lsgi).count()
        print(f"LSGI: {lsgi.name} ({lsgi.id}) - Wards: {ward_count}")
