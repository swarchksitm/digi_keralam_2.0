from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q, Count
from .models import TrainingSession, SessionAssignment
from .serializers import (
    TrainingSessionSerializer, 
    SessionAssignmentSerializer
)
from .permissions import IsDistrictMasterTrainer, CanManageSession
from utils.clients import ProfileClient, GeoClient

class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingSessionSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageSession]

    def get_queryset(self):
        user = self.request.user
        token = str(self.request.auth) # JWT Token string

        # Fetch Profile Context
        # NOTE: In production, cache this!
        profile_data = ProfileClient.get_profile(token)
        if not profile_data:
            return TrainingSession.objects.none()
            
        profile = profile_data.get('profile', {})
        
        # 1. District Master Trainer: All sessions in their District
        if user.role == 'DISTRICT_MASTER_TRAINER':
            district_id = profile.get('district')
            if district_id:
                # API Call to Geo Service to get Ward IDs
                ward_ids = GeoClient.get_wards_in_district(district_id)
                return TrainingSession.objects.filter(ward_id__in=ward_ids)
        
        # 2. LSGI Field Trainer: Assigned sessions + All in their LSGI/Ward
        if user.role == 'LSGI_FIELD_TRAINER':
            ward_id = profile.get('ward')
            # Fetch explicitly assigned sessions and those in strict ward
            return TrainingSession.objects.filter(
                Q(assignments__trainer_id=user.id) | 
                Q(ward_id=ward_id)
            ).distinct()
            
        # 3. Citizen: Sessions in their Ward
        if user.role == 'CITIZEN':
             ward_id = profile.get('ward')
             return TrainingSession.objects.filter(ward_id=ward_id, status='SCHEDULED')

        # 4. Admins: Bound to their geography
        if user.role == 'LSGD_DISTRICT_ADMIN':
            district_id = profile.get('district')
            if district_id:
                ward_ids = GeoClient.get_wards_in_district(district_id)
                return TrainingSession.objects.filter(ward_id__in=ward_ids)
            
        return TrainingSession.objects.none()

    def perform_create(self, serializer):
        # Only District Master Trainer can create
        if self.request.user.role != 'DISTRICT_MASTER_TRAINER':
            raise PermissionDenied("Only District Master Trainers can create sessions.")
        serializer.save(created_by_id=self.request.user.id)

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = SessionAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDistrictMasterTrainer]

    def get_queryset(self):
        token = str(self.request.auth)
        profile_data = ProfileClient.get_profile(token)
        if not profile_data:
            return SessionAssignment.objects.none()
            
        if self.request.user.role == 'DISTRICT_MASTER_TRAINER':
             district_id = profile_data.get('profile', {}).get('district')
             if district_id:
                 ward_ids = GeoClient.get_wards_in_district(district_id)
                 return SessionAssignment.objects.filter(session__ward_id__in=ward_ids)
                 
        return SessionAssignment.objects.none()
