from django.db import transaction
from django.contrib.auth import get_user_model
import sys

# Force import from profiles because I know it's there
from profiles.models import UserProfile

# User IDs from Auth Service (Confirmed from Step 2469 output)
MASTER_ID = 5
FIELD_ID = 6
CITIZEN_ID = 7
STATE_ID = 8

def create_profile(user_id, **kwargs):
    # Need to simulate User existence if UserProfile.user is ForeignKey to AUTH_USER_MODEL
    # Stateless services often don't have local users unless synced.
    # Check if User model exists and create stub if needed.
    User = get_user_model()
    
    # Check if user exists (local stub)
    if not User.objects.filter(id=user_id).exists():
        # Create user stub
        User.objects.create(id=user_id, username=f"user_{user_id}", password="stub_password")
        print(f"Created Stub User {user_id}")
    
    user = User.objects.get(id=user_id)
    
    # Check/Create Profile
    if not UserProfile.objects.filter(user=user).exists():
        UserProfile.objects.create(user=user, **kwargs)
        print(f"Created Profile for User {user_id}")
    else:
        print(f"Profile for User {user_id} already exists.")

# Create Profiles
# District 1, Ward 1
create_profile(MASTER_ID, district_id=1)
create_profile(FIELD_ID, ward_id=1)
create_profile(CITIZEN_ID, ward_id=1)
create_profile(STATE_ID) # No geo
