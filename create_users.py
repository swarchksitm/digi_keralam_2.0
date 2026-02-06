from django.contrib.auth import get_user_model
User = get_user_model()
users_to_create = [
    {'username': 'master_trainer', 'role': 'DISTRICT_MASTER_TRAINER', 'phone': '9999999991'},
    {'username': 'field_trainer', 'role': 'LSGI_FIELD_TRAINER', 'phone': '9999999992'},
    {'username': 'citizen_user', 'role': 'CITIZEN', 'phone': '9999999993'},
    {'username': 'state_admin', 'role': 'LSGD_STATE_ADMIN', 'phone': '9999999994'}
]
for data in users_to_create:
    if not User.objects.filter(username=data['username']).exists():
        # Using 'phone' as the kwarg if models.py confirms it.
        # Based on error 'unexpected keyword argument phone_number', it's likely 'phone' or created via Profile?
        # Standard Django User doesn't have phone. Custom User usually does.
        # If Auth Service uses Custom User.
        user = User.objects.create_user(username=data['username'], password='password123', role=data['role'], phone=data['phone'])
        print(f"Created User: {user.username} ID={user.id}")
    else:
        u = User.objects.get(username=data['username'])
        print(f"User Exists: {u.username} ID={u.id}")
