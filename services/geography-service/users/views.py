from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class TrainerListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Filter for Field Trainers only
        queryset = User.objects.filter(role='LSGI_FIELD_TRAINER')
        
        # Filter by Ward (passed as query param)
        ward_id = self.request.query_params.get('ward')
        if ward_id:
            queryset = queryset.filter(profile__ward_id=ward_id)
            
        return queryset
