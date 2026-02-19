import os
import pandas as pd
from django.core.management.base import BaseCommand
from django.conf import settings
from locations.models import District, Block, LSGI, Ward

class Command(BaseCommand):
    help = 'Import LSGI data from an Excel file'

    def add_arguments(self, parser):
        parser.add_argument('file_name', type=str, help='Name of the Excel file in legacy_backend/data/')

    def handle(self, *args, **options):
        file_name = options['file_name']
        file_path = os.path.join(settings.BASE_DIR, 'data', file_name)

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Reading file: {file_path}'))

        try:
            if file_name.endswith('.csv'):
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
            
            # Normalize headers to lowercase/strip
            df.columns = df.columns.astype(str).str.lower().str.strip()
            
            # Column Mapping based on user screenshot:
            # SLNo, OFFICE_NAME, LBCode, DISTRICT_NAME, WARD_NO, WARD_NAME_ENG, WARD_NAME_MAL
            
            for index, row in df.iterrows():
                try:
                    # Extract raw values
                    district_name = str(row.get('district_name', '')).strip()
                    office_name = str(row.get('office_name', '')).strip() # LSGI Name
                    lb_code = str(row.get('lbcode', '')).strip()
                    ward_no = row.get('ward_no')
                    ward_name_eng = str(row.get('ward_name_eng', '')).strip()
                    ward_name_mal = str(row.get('ward_name_mal', '')).strip()

                    if not district_name or not office_name:
                        continue

                    # 1. Get/Create District
                    dist_code = district_name[:3].upper()
                    district, _ = District.objects.get_or_create(
                        name__iexact=district_name,
                        defaults={'name': district_name, 'code': dist_code}
                    )

                    # 2. Determine LSGI Type from OFFICE_NAME
                    # Heuristic: Check keywords in the name
                    name_lower = office_name.lower()
                    lsgi_type = LSGI.Type.GRAMA_PANCHAYAT # Default
                    if 'municipality' in name_lower:
                        lsgi_type = LSGI.Type.MUNICIPALITY
                    elif 'corporation' in name_lower:
                        lsgi_type = LSGI.Type.CORPORATION
                    elif 'block' in name_lower:
                        lsgi_type = LSGI.Type.BLOCK_PANCHAYAT
                    elif 'district panchayat' in name_lower:
                        lsgi_type = LSGI.Type.DISTRICT_PANCHAYAT

                    # Clean LSGI Name (optional, remove "Grama Panchayat" etc if desired, or keep full)
                    # For now keeping full name as provided in OFFICE_NAME

                    # 3. Create/Update LSGI
                    # Note: We rely on Name + District + Type uniqueness. 
                    # If LBCode is present, we could use that, but logic below updates valid fields.
                    lsgi, _ = LSGI.objects.update_or_create(
                        name__iexact=office_name,
                        district=district,
                        lsgi_type=lsgi_type,
                        defaults={
                            'name': office_name,
                            'code': lb_code if lb_code and lb_code != 'nan' else None
                        }
                    )

                    # 4. Create/Update Ward
                    if pd.notna(ward_no):
                        try:
                            ward_num = int(ward_no)
                            Ward.objects.update_or_create(
                                lsgi=lsgi,
                                number=ward_num,
                                defaults={
                                    'name': ward_name_eng,
                                    'name_mal': ward_name_mal
                                }
                            )
                        except ValueError:
                            self.stdout.write(self.style.WARNING(f"Invalid Ward No '{ward_no}' for {office_name}"))

                    if index % 100 == 0:
                        self.stdout.write(f"Processed {index} rows...")

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing row {index}: {e}"))

            self.stdout.write(self.style.SUCCESS('Import process completed.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to read Excel file: {e}'))
