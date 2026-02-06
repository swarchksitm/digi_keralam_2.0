from django.core.management.base import BaseCommand
from locations.models import District, Block, LSGI, Ward

class Command(BaseCommand):
    help = 'Seeds initial geography data for Kerala'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding geography data...')
        
        districts = [
            ('Thiruvananthapuram', 'TVM'),
            ('Kollam', 'KLM'),
            ('Ernakulam', 'EKM'),
            ('Kozhikode', 'KKD'),
        ]

        for name, code in districts:
            district, created = District.objects.get_or_create(name=name, code=code)
            if created:
                self.stdout.write(f'Created District: {name}')
                
                # 1. Create a Corporation (Directly under District)
                corp, _ = LSGI.objects.get_or_create(
                    name=f'{name} Corporation',
                    lsgi_type=LSGI.Type.CORPORATION,
                    district=district,
                    block=None 
                )
                self.create_wards(corp)

                # 2. Create a Block
                block, _ = Block.objects.get_or_create(
                    name=f'{name} Block 1',
                    code=f'{code}-B1',
                    district=district
                )
                
                # 3. Create Grama Panchayats under Block
                gp, _ = LSGI.objects.get_or_create(
                    name=f'{name} Panchayat 1',
                    lsgi_type=LSGI.Type.GRAMA_PANCHAYAT,
                    district=district,
                    block=block
                )
                self.create_wards(gp)

        self.stdout.write(self.style.SUCCESS('Geography seeding completed.'))

    def create_wards(self, lsgi):
        for i in range(1, 6):
            Ward.objects.get_or_create(
                number=i,
                name=f'Ward {i}',
                lsgi=lsgi
            )
