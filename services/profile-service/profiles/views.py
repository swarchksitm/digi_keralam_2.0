from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from users.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfileView(generics.RetrieveAPIView):
    """
    Retrieve the profile of the currently logged-in user.
    """
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class TrainerListView(generics.ListAPIView):
    """
    List Field Trainers, optionally filtered by ward.
    """
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # We need to filter by the specific Role string.
        # Assuming 'LSGI_FIELD_TRAINER' based on legacy code.
        # Better to access valid choices from User model if possible, but hardcoding for now based on legacy view.
        
        queryset = User.objects.filter(role='LSGI_FIELD_TRAINER')
        
        ward_id = self.request.query_params.get('ward_id') # User request says ward_id=
        if ward_id:
            queryset = queryset.filter(profile__ward_id=ward_id)
            
        return queryset
