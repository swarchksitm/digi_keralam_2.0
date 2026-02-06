from django.contrib.auth import get_user_model
User = get_user_model()
try:
    u = User.objects.get(username='admin')
    u.set_password('admin123')
    u.save()
except User.DoesNotExist:
    pass
