
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from locations.models import LSGI, Ward

lsgi_id = 2469

try:
    lsgi = LSGI.objects.get(id=lsgi_id)
    print(f"LSGI Found: {lsgi.name} ({lsgi.lsgi_type})")
    print(f"District: {lsgi.district.name}")
    
    wards = Ward.objects.filter(lsgi=lsgi)
    print(f"Ward Count: {wards.count()}")
    
    if wards.count() > 0:
        print("First 5 wards:")
        for w in wards[:5]:
            print(f"- {w.number}: {w.name}")
    else:
        print("NO WARDS FOUND for this LSGI.")
        
        # Check if there are wards for 'Thiruvananthapuram Corporation' under a different ID
        others = LSGI.objects.filter(name__icontains='Thiruvananthapuram', lsgi_type='CORPORATION')
        for o in others:
            if o.id != lsgi_id:
                c = Ward.objects.filter(lsgi=o).count()
                print(f"Found another 'Thiruvananthapuram Corporation' with ID {o.id} having {c} wards.")

except LSGI.DoesNotExist:
    print(f"LSGI with ID {lsgi_id} DOES NOT EXIST.")
    # Search for it by name
    others = LSGI.objects.filter(name__icontains='Thiruvananthapuram', lsgi_type='CORPORATION')
    if others.exists():
        print("Found these Thiruvananthapuram Corporations:")
        for o in others:
             c = Ward.objects.filter(lsgi=o).count()
             print(f"- ID: {o.id}, Name: {o.name}, Wards: {c}")

