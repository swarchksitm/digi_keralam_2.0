from django.urls import path
from .views import UserProfileView, TrainerListView

urlpatterns = [
    path('me/', UserProfileView.as_view(), name='profile-me'),
    path('trainers/', TrainerListView.as_view(), name='profile-trainers'),
]
