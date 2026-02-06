from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('training_sessions.urls')),  # For /api/sessions/ (New)
    path('api/training/', include('training_sessions.urls')),  # For /api/training/sessions/ (Legacy)
]
