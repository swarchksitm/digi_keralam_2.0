from django.core.management.base import BaseCommand
from locations.models import District, LSGI, Block

class Command(BaseCommand):
    help = 'Seeds the database with Kerala Districts and sample LSGIs'

    def handle(self, *args, **options):
        self.stdout.write('Seeding locations...')

        # 14 Districts of Kerala
        districts_data = [
            {'name': 'Thiruvananthapuram', 'code': 'TVM'},
            {'name': 'Kollam', 'code': 'KLM'},
            {'name': 'Pathanamthitta', 'code': 'PTA'},
            {'name': 'Alappuzha', 'code': 'ALP'},
            {'name': 'Kottayam', 'code': 'KTM'},
            {'name': 'Idukki', 'code': 'IDK'},
            {'name': 'Ernakulam', 'code': 'EKM'},
            {'name': 'Thrissur', 'code': 'TCR'},
            {'name': 'Palakkad', 'code': 'PKD'},
            {'name': 'Malappuram', 'code': 'MPM'},
            {'name': 'Kozhikode', 'code': 'KKD'},
            {'name': 'Wayanad', 'code': 'WYD'},
            {'name': 'Kannur', 'code': 'KNR'},
            {'name': 'Kasargod', 'code': 'KSD'},
        ]

        for d_data in districts_data:
            district, created = District.objects.get_or_create(
                code=d_data['code'],
                defaults={'name': d_data['name']}
            )
            if created:
                self.stdout.write(f"Created District: {district.name}")

            # Create Sample Block
            block, _ = Block.objects.get_or_create(
                code=f"{d_data['code']}_BLK_1",
                district=district,
                defaults={'name': f"{district.name} Block 1"}
            )

            # Create Sample LSGIs
            
            # 1. Corporation (if applicable, strictly logic-wise usually only major cities have corp, 
            # but for testing we can add one or check blindly)
            # Let's add Corporation only for TVM, EKM, KNR, KLM, TCR, KKD (Real Kerala Logic)
            major_cities = ['Thiruvananthapuram', 'Kollam', 'Ernakulam', 'Thrissur', 'Kozhikode', 'Kannur']
            if district.name in major_cities:
                LSGI.objects.get_or_create(
                    name=f"{district.name} Corporation",
                    district=district,
                    lsgi_type='CORPORATION',
                    defaults={'block': None}
                )

            # 2. Municipality
            LSGI.objects.get_or_create(
                name=f"{district.name} Municipality",
                district=district,
                lsgi_type='MUNICIPALITY',
                defaults={'block': None}
            )

            # 3. Grama Panchayats (linked to Block)
            LSGI.objects.get_or_create(
                name=f"{district.name} Panchayat 1",
                district=district,
                lsgi_type='GP',
                defaults={'block': block}
            )
            LSGI.objects.get_or_create(
                name=f"{district.name} Panchayat 2",
                district=district,
                lsgi_type='GP',
                defaults={'block': block}
            )

             # 4. District Panchayat
            LSGI.objects.get_or_create(
                name=f"{district.name} District Panchayat",
                district=district,
                lsgi_type='DP',
                defaults={'block': None}
            )
            
            # 5. Block Panchayat
            LSGI.objects.get_or_create(
                name=f"{block.name} Block Panchayat",
                district=district,
                lsgi_type='BP',
                defaults={'block': block}
            )
            
        self.stdout.write(self.style.SUCCESS('Successfully seeded locations'))
