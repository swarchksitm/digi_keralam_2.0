
import os
import csv
import django
from django.conf import settings
from django.db import transaction

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from locations.models import LSGI, Ward, District

CSV_FILE = 'data/LSGI_MASTER_DATA.csv'

def fix_missing_wards():
    print("Starting ward fix process...")
    
    # load CSV data into memory for fast lookup
    csv_data = {} # Key: (District Name, LSGI Name) -> List of Wards
    
    # We need a robust matching key. 
    # CSV has: DISTRICT_NAME, OFFICE_NAME, WARD_NO, WARD_NAME_ENG
    
    print("Reading CSV data...")
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                dist_name = row['DISTRICT_NAME'].strip()
                lsgi_name = row['OFFICE_NAME'].strip()
                # Normalize names slightly?
                
                key = (dist_name.lower(), lsgi_name.lower())
                
                if key not in csv_data:
                    csv_data[key] = {
                        'code': row.get('LBCode', '').strip(),
                        'wards': []
                    }
                
                csv_data[key]['wards'].append({
                    'no': int(row['WARD_NO']),
                    'name': row['WARD_NAME_ENG'].strip(),
                    'name_mal': row['WARD_NAME_MAL'].strip()
                })
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    print(f"Loaded data for {len(csv_data)} LSGIs from CSV.")

    # Find matches in DB
    # We'll check ALL LSGIs, or just those with 0 wards?
    # Checking those with 0 wards is safer to avoid duplication.
    
    empty_lsgis = []
    for lsgi in LSGI.objects.all():
        if lsgi.wards.count() == 0:
            empty_lsgis.append(lsgi)
            
    print(f"Found {len(empty_lsgis)} LSGIs with 0 wards in DB.")
    
    fixed_count = 0
    
    with open('debug_fix.log', 'w', encoding='utf-8') as log:
        with transaction.atomic():
            for lsgi in empty_lsgis:
                db_dist_name = lsgi.district.name.strip().lower()
                db_lsgi_name = lsgi.name.strip().lower()
                
                # Try exact match
                key = (db_dist_name, db_lsgi_name)
                
                log.write(f"Checking DB LSGI: '{db_lsgi_name}' in District '{db_dist_name}'\n")
                
                # Try variations if not found (e.g. "Municipal Corporation" vs "Corporation")
                match = csv_data.get(key)
                
                if not match:
                    log.write(f"  Exact match failed for key: {key}\n")
                    
                    # Dump relevant CSV keys from this district for comparison
                    dist_matches = [k for k in csv_data.keys() if k[0] == db_dist_name]
                    
                    # Advanced matching for Corporations/Municipalities
                    if lsgi.lsgi_type == 'CORPORATION':
                        # Try adding "Municipal Corporation"
                        alt_name_1 = f"{db_lsgi_name} municipal corporation"
                        match = csv_data.get((db_dist_name, alt_name_1))
                        if match: 
                            log.write(f"  - Matched with 'Municipal Corporation' suffix\n")
                        
                        if not match:
                            # Try adding just "Corporation"
                            alt_name_2 = f"{db_lsgi_name} corporation"
                            match = csv_data.get((db_dist_name, alt_name_2))
                            if match:
                                log.write(f"  - Matched with 'Corporation' suffix\n")

                    elif lsgi.lsgi_type == 'MUNICIPALITY':
                         # Try adding "Municipality"
                        alt_name = f"{db_lsgi_name} municipality"
                        match = csv_data.get((db_dist_name, alt_name))
                        if match:
                            log.write(f"  - Matched with 'Municipality' suffix\n")

                if match:
                    log.write(f"Found match! Importing wards...\n")
                    print(f"Found match for '{lsgi.name}' ({lsgi.district.name}). Importing {len(match['wards'])} wards...")
                    
                    # Update Code if missing
                    if not lsgi.code and match['code']:
                        lsgi.code = match['code']
                        lsgi.save()
                        
                    # Create Wards
                    wards_to_create = []
                    for w_data in match['wards']:
                        wards_to_create.append(Ward(
                            lsgi=lsgi,
                            number=w_data['no'],
                            name=w_data['name'],
                            name_mal=w_data['name_mal']
                        ))
                    
                    Ward.objects.bulk_create(wards_to_create)
                    fixed_count += 1
                else:
                    log.write(f"  NO MATCH FOUND for '{lsgi.name}' ({lsgi.district.name})\n")
                    # print(f"  No match found in CSV for '{lsgi.name}'")

    print(f"Successfully fixed {fixed_count} LSGIs.")
    print(f"Check debug_fix.log for details on unmatched LSGIs.")

if __name__ == '__main__':
    fix_missing_wards()
