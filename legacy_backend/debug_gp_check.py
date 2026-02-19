
import os
import django
from django.conf import settings
from django.db.models import Count, Q

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from locations.models import LSGI, Ward

print("--- Verifying Grama Panchayats ---")

# Filter for Grama Panchayats
# Assuming type is 'GRAMA_PANCHAYAT' or similar. Let's check distinct types first.
types = LSGI.objects.values_list('lsgi_type', flat=True).distinct()
print(f"LSGI Types found: {list(types)}")

gps = LSGI.objects.filter(lsgi_type='GRAMA_PANCHAYAT')
print(f"Total Grama Panchayats: {gps.count()}")

# Check for empty ones
empty_gps = []
for gp in gps:
    if gp.wards.count() == 0:
        empty_gps.append(gp)

print(f"Grama Panchayats with 0 wards: {len(empty_gps)}")

if len(empty_gps) > 0:
    print("Empty GPs:")
    for gp in empty_gps:
        print(f"- {gp.name} ({gp.district.name})")
else:
    print("ALL Grama Panchayats have wards.")

# Show a sample from different districts
print("\nSample Data (One per district, first 5 districts):")
district_ids = LSGI.objects.values_list('district', flat=True).distinct()[:5]

for dist_id in district_ids:
    gp = LSGI.objects.filter(district_id=dist_id, lsgi_type='GP').first()
    if gp:
        print(f"- {gp.name} ({gp.district.name}): {gp.wards.count()} wards")
    else:
        # try filtering by type 'G' or whatever corresponds to GP in your model
        # The previous run output showed types as ['M', 'C', 'B', 'G', 'D'] likely for Municipality, Corporation, Block, Grama, District
        # Let's adjust the filter.
        pass

# Re-checking types based on previous output ['M', 'C', 'B', 'G', 'D'] or similar
print(f"Refining type check...")
gps_g = LSGI.objects.filter(lsgi_type='G')
if gps_g.exists():
    print(f"Total 'G' (Grama Panchayat) Type LSGIs: {gps_g.count()}")
    
    empty_count = 0
    for g in gps_g:
        if g.wards.count() == 0:
            empty_count += 1
            
    print(f"Grama Panchayats with 0 wards: {empty_count}")
    
    if empty_count == 0:
        print("SUCCESS: All Grama Panchayats have wards populated.")
    
    print("\nSample Grama Panchayats:")
    for g in gps_g[:5]:
        print(f"  - {g.name} ({g.district.name}): {g.wards.count()} wards")
