from django.core.management.base import BaseCommand
from locations.models import District, Block, LSGI, Ward

class Command(BaseCommand):
    help = 'Deletes all location data (Districts, Blocks, LSGIs, Wards)'

    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting Wards...")
        Ward.objects.all().delete()
        
        self.stdout.write("Deleting LSGIs...")
        LSGI.objects.all().delete()
        
        self.stdout.write("Deleting Blocks...")
        Block.objects.all().delete()
        
        self.stdout.write("Deleting Districts...")
        District.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('Successfully deleted all location data.'))
