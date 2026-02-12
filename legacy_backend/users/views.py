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
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"UserProfileView.get_object called for user: {self.request.user}")
        try:
            return self.request.user
        except Exception as e:
             logger.error(f"Error in get_object: {e}")
             raise

from rest_framework import viewsets, status
from rest_framework.response import Response
from .serializers import AdminUserSerializer
from .permissions import IsKsitSuperAdmin, IsStateAdmin, IsDistrictAdmin, IsLsgiAdmin, IsMasterTrainer
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
            # Allow Super Admin, State Admin, District Admin, LSGI Admin, and Master Trainer
            return [permissions.IsAuthenticated(), (IsKsitSuperAdmin | IsStateAdmin | IsDistrictAdmin | IsLsgiAdmin | IsMasterTrainer)()]
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
        
        elif user.role == User.Role.LSGD_DISTRICT_ADMIN:
            # District Admin sees LSGI Admins AND Master Trainers in their district
            if not hasattr(user, 'profile') or not user.profile.district:
                 return queryset.none()
            
            qs = queryset.filter(
                Q(role=User.Role.LSGI_ADMIN, profile__district=user.profile.district) |
                Q(role=User.Role.DISTRICT_MASTER_TRAINER, profile__district=user.profile.district)
            ).distinct()

            target_role = self.request.query_params.get('role')
            if target_role:
                qs = qs.filter(role=target_role)
            
            return qs

        elif user.role == User.Role.LSGI_ADMIN:
            # LSGI Admin sees Master Trainers (created by them -> in their LSGI) and Local Trainers
            if not hasattr(user, 'profile') or not user.profile.lsgi:
                return queryset.none()
            
            # Master Trainers in this LSGI + Field Trainers in this LSGI
            qs = queryset.filter(
                Q(role=User.Role.DISTRICT_MASTER_TRAINER, profile__lsgi=user.profile.lsgi) |
                Q(role=User.Role.LSGI_FIELD_TRAINER, profile__lsgi=user.profile.lsgi)
            ).distinct()

            target_role = self.request.query_params.get('role')
            if target_role:
                qs = qs.filter(role=target_role)

            return qs

        elif user.role == User.Role.DISTRICT_MASTER_TRAINER:
            # Master Trainer sees Local Trainers 
            if not hasattr(user, 'profile') or not user.profile.district:
                return queryset.none()

            # Base filter: Field Trainers in the District
            qs = queryset.filter(
                role=User.Role.LSGI_FIELD_TRAINER,
                profile__district=user.profile.district
            )

            # If Master Trainer is bound to a specific LSGI (e.g. created by LSGI Admin), restrict visibility
            if user.profile.lsgi:
                qs = qs.filter(profile__lsgi=user.profile.lsgi)
                
            return qs
            
        return queryset.none()

    def perform_create(self, serializer):
        # Auto-assign role based on creator
        user = self.request.user
        from rest_framework.exceptions import ValidationError

        if user.role == User.Role.KSITM_SUPER_ADMIN:
            # ... (super admin logic same) ...
            if User.objects.filter(role=User.Role.LSGD_STATE_ADMIN).exists():
                raise ValidationError({"detail": "Only one State Admin account is allowed."})
            serializer.save(role=User.Role.LSGD_STATE_ADMIN)
            
        elif user.role == User.Role.LSGD_STATE_ADMIN:
            serializer.save(role=User.Role.LSGD_DISTRICT_ADMIN)
            
        elif user.role == User.Role.LSGD_DISTRICT_ADMIN:
             # District Admin logic
             target_role = serializer.initial_data.get('role')
             
             if target_role == User.Role.DISTRICT_MASTER_TRAINER:
                 lsgi_id = serializer.initial_data.get('lsgi_id')
                 if not lsgi_id:
                     raise ValidationError({"lsgi_id": "LSGI selection is required for Master Trainer as they are now LSGI-level."})
                     
                 serializer.save(
                    role=User.Role.DISTRICT_MASTER_TRAINER,
                    district_id=user.profile.district.id,
                    lsgi_id=lsgi_id
                 )
             else:
                lsgi_id = serializer.initial_data.get('lsgi_id')
                if not lsgi_id:
                    raise ValidationError({"lsgi_id": "LSGI selection is required for LSGI Admin."})
                # ... validation ...
                from locations.models import LSGI
                try:
                    lsgi = LSGI.objects.get(id=lsgi_id)
                    if lsgi.district != user.profile.district:
                            raise ValidationError({"lsgi_id": "Cannot assign Admin to LSGI outside your district."})
                except LSGI.DoesNotExist:
                        raise ValidationError({"lsgi_id": "Invalid LSGI."})

                serializer.save(role=User.Role.LSGI_ADMIN)

        elif user.role == User.Role.LSGI_ADMIN:
            # LSGI Admin creates District Master Trainer BOUND TO THIS LSGI
            serializer.save(
                role=User.Role.DISTRICT_MASTER_TRAINER,
                district_id=user.profile.district.id,
                lsgi_id=user.profile.lsgi.id 
            )

        elif user.role == User.Role.DISTRICT_MASTER_TRAINER:
            # Master Trainer creates LSGI Field Trainer
            lsgi_id = serializer.initial_data.get('lsgi_id')
            
            # If Master Trainer is bound to an LSGI, restrict creation to that LSGI
            if user.profile.lsgi:
                 if lsgi_id and int(lsgi_id) != user.profile.lsgi.id:
                     raise ValidationError({"lsgi_id": "You can only create Field Trainers in your assigned LSGI."})
                 # Auto-inject LSGI if not provided? Or enforce it matches?
                 # If frontend sends nothing, we could auto-set, but serializer expects ID.
                 # Let's rely on validation.
            
            if lsgi_id:
                from locations.models import LSGI
                try:
                    lsgi = LSGI.objects.get(id=lsgi_id)
                    if lsgi.district != user.profile.district:
                         raise ValidationError({"lsgi_id": "Cannot assign trainer to LSGI outside your district."})
                except LSGI.DoesNotExist:
                     pass

            serializer.save(role=User.Role.LSGI_FIELD_TRAINER)

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = AdminUserSerializer

    def perform_create(self, serializer):
        # Allow CITIZEN role by default, handling via serializer or explicit role setting
        role = self.request.data.get('role', 'CITIZEN')
        
        # Security: Prevent random users from creating Admin accounts
        if role not in ['CITIZEN', 'LSGI_FIELD_TRAINER']:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Self-registration is only allowed for Citizens and Field Trainers.")

        # If Field Trainer, ensure LSGI is provided? Serializer handles it but we can enforce here too
        
        serializer.save(role=role)
