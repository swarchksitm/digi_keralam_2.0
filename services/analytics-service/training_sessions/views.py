from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import TrainingSession, SessionAssignment, Attendance
from .serializers import (
    TrainingSessionSerializer, 
    SessionAssignmentSerializer, 
    AttendanceSerializer
)
from .permissions import IsDistrictMasterTrainer, CanManageSession

class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingSessionSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageSession]

    def get_queryset(self):
        user = self.request.user
        
        # 1. District Master Trainer: All sessions in their District
        if user.role == 'DISTRICT_MASTER_TRAINER':
            district = user.profile.district
            return TrainingSession.objects.filter(ward__lsgi__district=district)
        
        # 2. LSGI Field Trainer: Assigned sessions + All in their LSGI/Ward
        if user.role == 'LSGI_FIELD_TRAINER':
            # Logic: Explicit assignments OR geo-match
            # Assuming Field Trainer is bound to Ward (could be LSGI too based on SRS, but profile has Ward)
            ward = user.profile.ward
            return TrainingSession.objects.filter(
                Q(assignments__trainer=user) | 
                Q(ward=ward)
            ).distinct()
            
        # 3. Citizen: Sessions in their Ward
        if user.role == 'CITIZEN':
             ward = user.profile.ward
             # Also filter by Proficiency? SRS says "matching location and proficiency"
             # Assuming citizen has no proficiency field yet, filtering by Ward for now.
             return TrainingSession.objects.filter(ward=ward, status='SCHEDULED')

        # 4. Admins: Bound to their geography
        if user.role == 'LSGD_DISTRICT_ADMIN':
            return TrainingSession.objects.filter(ward__lsgi__district=user.profile.district)
            
        return TrainingSession.objects.none()

    def perform_create(self, serializer):
        # Additional enforcement: Only District Master Trainer can create
        if self.request.user.role != 'DISTRICT_MASTER_TRAINER':
            raise PermissionDenied("Only District Master Trainers can create sessions.")
        serializer.save(created_by=self.request.user)

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = SessionAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDistrictMasterTrainer]

    def get_queryset(self):
        # Only Master Trainers can manage assignments
        if self.request.user.role == 'DISTRICT_MASTER_TRAINER':
             district = self.request.user.profile.district
             return SessionAssignment.objects.filter(session__ward__lsgi__district=district)
        return SessionAssignment.objects.none()
