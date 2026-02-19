
import os
import django
from django.conf import settings
from rest_framework.test import APIRequestFactory

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from locations.views import WardListView
from locations.models import LSGI

factory = APIRequestFactory()
# Get a valid LSGI ID
lsgi = LSGI.objects.first()
print(f"Testing with LSGI: {lsgi.name} ({lsgi.id})")

request = factory.get('/locations/wards/', {'lsgi': lsgi.id})
view = WardListView.as_view()
response = view(request)

print(f"Status Code: {response.status_code}")
print(f"Data count: {len(response.data)}")
if len(response.data) > 0:
    print(f"First ward: {response.data[0]['name']}")
else:
    print("No wards returned")
