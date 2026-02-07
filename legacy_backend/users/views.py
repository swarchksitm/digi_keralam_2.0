from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer, UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

from rest_framework import viewsets, status
from rest_framework.response import Response
from .serializers import AdminUserSerializer
from .permissions import IsKsitSuperAdmin, IsStateAdmin
from django.db.models import Q

class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            from .serializers import UserSerializer
            return UserSerializer
        return AdminUserSerializer

    def get_permissions(self):
        # Strict permission control
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            # Only Super Admin or State Admin can manage users
            return [permissions.IsAuthenticated(), (IsKsitSuperAdmin | IsStateAdmin)()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.all()

        if user.role == User.Role.KSITM_SUPER_ADMIN:
            # Super Admin sees State Admins by default, or District Admins if requested
            target_role = self.request.query_params.get('role')
            if target_role == User.Role.LSGD_DISTRICT_ADMIN:
                return queryset.filter(role=User.Role.LSGD_DISTRICT_ADMIN)
            return queryset.filter(role=User.Role.LSGD_STATE_ADMIN)
        
        elif user.role == User.Role.LSGD_STATE_ADMIN:
            # State Admin sees District Admins
            return queryset.filter(role=User.Role.LSGD_DISTRICT_ADMIN)
            
        return queryset.none()

    def perform_create(self, serializer):
        # Auto-assign role based on creator
        user = self.request.user
        if user.role == User.Role.KSITM_SUPER_ADMIN:
            # Enforce Single State Admin Policy
            if User.objects.filter(role=User.Role.LSGD_STATE_ADMIN).exists():
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"detail": "Only one State Admin account is allowed."})
            serializer.save(role=User.Role.LSGD_STATE_ADMIN)
        elif user.role == User.Role.LSGD_STATE_ADMIN:
            serializer.save(role=User.Role.LSGD_DISTRICT_ADMIN)

