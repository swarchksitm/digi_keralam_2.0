
import csv

filename = 'data/LSGI_MASTER_DATA.csv'

try:
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        found = False
        print("Searching for Corporations...")
        for row in reader:
            if 'Corporation' in row['OFFICE_NAME'] or 'Corporation' in row.get('LBCode', ''):
                # Check for Thiruvananthapuram
                if 'Thiruvananthapuram' in row['DISTRICT_NAME'] and 'Corporation' in row['OFFICE_NAME']:
                    if not found:
                        print(f"FOUND: {row['OFFICE_NAME']} (Code: {row['LBCode']})")
                        found = True
                    # Print first few wards
                    if int(row['WARD_NO']) <= 3:
                        print(f"  - Ward {row['WARD_NO']}: {row['WARD_NAME_ENG']}")
        
        if not found:
            print("Thiruvananthapuram Corporation NOT FOUND in dataset.")
        else:
            print("Done listing first 3 wards.")

except Exception as e:
    print(f"Error reading file: {e}")
