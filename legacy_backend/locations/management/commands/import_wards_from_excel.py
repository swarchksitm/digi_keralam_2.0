from django.core.management.base import BaseCommand
from locations.models import District, LSGI, Ward, Block
import pandas as pd
import os

class Command(BaseCommand):
    help = 'Imports Wards and LSGIs from an Excel file'

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the Excel file')

    def handle(self, *args, **options):
        file_path = options['file_path']
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write(f'Reading file: {file_path}...')
        
        try:
            df = pd.read_excel(file_path)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to read Excel file: {str(e)}'))
            return

        # Expected Columns (User provided): 
        # SLNo, office Name, LBCode, District Name, Ward No, Ward Name Eng, Ward Name Mal
        
        # Normalize column names to lower case
        df.columns = df.columns.str.strip().str.lower()
        
        # Mapping User Headers to our logic
        col_map = {
            'district': 'district name',
            'lsgi_name': 'office name',
            'ward_no': 'ward no',
            'ward_name': 'ward name eng',
            'ward_name_mal': 'ward name mal'
        }
        
        # Check if columns exist
        found_cols = {}
        for key, desired in col_map.items():
            match = next((c for c in df.columns if desired in c), None)
            if match:
                found_cols[key] = match
        
        # Check required
        missing = [key for key in ['district', 'lsgi_name', 'ward_no', 'ward_name'] if key not in found_cols]
        if missing:
             self.stdout.write(self.style.ERROR(f'Missing required columns (partial match allowed): {missing}. Found: {list(df.columns)}'))
             return

        counts = {'districts': 0, 'lsgis': 0, 'wards': 0, 'blocks': 0}
        
        for index, row in df.iterrows():
            try:
                # 1. District
                dist_name = str(row[found_cols['district']]).strip()
                if not dist_name or dist_name.lower() == 'nan': continue
                
                # Simple code generation
                dist_code = dist_name[:3].upper()
                
                district, created = District.objects.get_or_create(
                    name__iexact=dist_name,
                    defaults={'name': dist_name, 'code': dist_code}
                )
                if created: counts['districts'] += 1
                
                # 2. Block (Not provided in new format, skip or infer?)
                block = None

                # 3. LSGI
                lsgi_name = str(row[found_cols['lsgi_name']]).strip()
                
                # Infer Type
                lsgi_type_str = 'GP' # Default
                upper_name = lsgi_name.upper()
                if 'MUNICIP' in upper_name: lsgi_type_str = 'MUNICIPALITY'
                elif 'CORPORATION' in upper_name: lsgi_type_str = 'CORPORATION'
                elif 'DISTRICT PANCHAYAT' in upper_name: lsgi_type_str = 'DP'
                elif 'BLOCK PANCHAYAT' in upper_name: lsgi_type_str = 'BP'
                else: lsgi_type_str = 'GP'
                
                lsgi, created = LSGI.objects.get_or_create(
                    name__iexact=lsgi_name,
                    district=district,
                    lsgi_type=lsgi_type_str,
                    defaults={'name': lsgi_name, 'block': block}
                )
                if created: counts['lsgis'] += 1
                
                # 4. Ward
                ward_no_raw = row[found_cols['ward_no']]
                try:
                    ward_no = int(ward_no_raw)
                except:
                    import re
                    match = re.search(r'\d+', str(ward_no_raw))
                    ward_no = int(match.group()) if match else 0
                
                ward_name = str(row[found_cols['ward_name']]).strip()
                ward_name_mal = ""
                if 'ward_name_mal' in found_cols:
                     ward_name_mal = str(row[found_cols['ward_name_mal']]).strip()
                     if ward_name_mal.lower() == 'nan': ward_name_mal = ""

                ward, created = Ward.objects.get_or_create(
                    lsgi=lsgi,
                    number=ward_no,
                    defaults={'name': ward_name, 'name_mal': ward_name_mal}
                )
                if not created and ward_name_mal:
                    # Update Malayalam name if missing
                    if not ward.name_mal:
                        ward.name_mal = ward_name_mal
                        ward.save()
                        
                if created: counts['wards'] += 1
                
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Row {index}: Error - {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f"Import Complete.\nCreated: {counts}"))
