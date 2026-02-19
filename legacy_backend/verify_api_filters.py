import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.test import RequestFactory
from users.views import AdminUserViewSet
from users.models import User

# Create a Master Trainer (to simulate the request)
User = get_user_model()
mt_username = 'debug_mt_verify'
password = 'password123'

if not User.objects.filter(username=mt_username).exists():
    mt = User.objects.create_user(username=mt_username, password=password, role=User.Role.DISTRICT_MASTER_TRAINER)
    # Give him a district
    from locations.models import District, State
    state, _ = State.objects.get_or_create(name='Kerala')
    district, _ = District.objects.get_or_create(name='Trivandrum', state=state)
    from profiles.models import UserProfile
    UserProfile.objects.create(user=mt, district=district)
    mt.save()
else:
    mt = User.objects.get(username=mt_username)

# Ensure at least one verified and one unverified field trainer exists in this district
ft_verified_username = 'ft_verified'
if not User.objects.filter(username=ft_verified_username).exists():
    ft_v = User.objects.create_user(username=ft_verified_username, role=User.Role.LSGI_FIELD_TRAINER, is_verified=True)
    UserProfile.objects.create(user=ft_v, district=district)
    ft_v.save()

ft_unverified_username = 'ft_unverified'
if not User.objects.filter(username=ft_unverified_username).exists():
    ft_u = User.objects.create_user(username=ft_unverified_username, role=User.Role.LSGI_FIELD_TRAINER, is_verified=False)
    UserProfile.objects.create(user=ft_u, district=district)
    ft_u.save()

# Now test the viewset
factory = RequestFactory()

# Test 1: Verified Only
request_v = factory.get('/api/auth/admin-users/', {'role': 'LSGI_FIELD_TRAINER', 'is_verified': 'true'})
request_v.user = mt
view_v = AdminUserViewSet.as_view({'get': 'list'})
response_v = view_v(request_v)
print(f"Verified Filter (is_verified='true'): Found {len(response_v.data)} users")
for u in response_v.data:
    print(f" - {u['username']} (Verified: {u.get('is_verified', 'Unknown')})")

# Test 2: Unverified Only
request_u = factory.get('/api/auth/admin-users/', {'role': 'LSGI_FIELD_TRAINER', 'is_verified': 'false'})
request_u.user = mt
view_u = AdminUserViewSet.as_view({'get': 'list'})
response_u = view_u(request_u)
print(f"Unverified Filter (is_verified='false'): Found {len(response_u.data)} users")
for u in response_u.data:
    print(f" - {u['username']} (Verified: {u.get('is_verified', 'Unknown')})")
