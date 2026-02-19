
import os
import django
from django.conf import settings
from django.db.models import Count

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from locations.models import LSGI, Ward

print("Checking for duplicate LSGIs and Ward counts...")

# Check specifically for Thiruvananthapuram Corporation variants
trivandrum_lsgis = LSGI.objects.filter(name__icontains='Thiruvananthapuram').filter(lsgi_type__in=['CORPORATION', 'MUNICIPALITY'])

if trivandrum_lsgis.exists():
    print(f"\nFound {trivandrum_lsgis.count()} potential matches for Thiruvananthapuram:")
    for lsgi in trivandrum_lsgis:
        ward_count = Ward.objects.filter(lsgi=lsgi).count()
        print(f"  - ID: {lsgi.id}, Name: '{lsgi.name}', Code: '{lsgi.code}', Type: {lsgi.lsgi_type}, Wards: {ward_count}")
else:
    print("\nNo LSGIs found matching 'Thiruvananthapuram' in Corporations/Municipalities.")

# Check for LSGIs with Code C010100
code_lsgi = LSGI.objects.filter(code='C010100')
if code_lsgi.exists():
    print(f"\nLSGI with code 'C010100' (from CSV):")
    for lsgi in code_lsgi:
        ward_count = Ward.objects.filter(lsgi=lsgi).count()
        print(f"  - ID: {lsgi.id}, Name: '{lsgi.name}', Wards: {ward_count}")
else:
    print("\nNo LSGI found with code 'C010100'.")
