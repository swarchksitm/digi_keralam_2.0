from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.contrib.auth import get_user_model
import pandas as pd
from django.db import transaction
from .models import TrainingSession, SessionAssignment, Attendance, Resource
from .serializers import (
    TrainingSessionSerializer, 
    SessionAssignmentSerializer, 
    AttendanceSerializer,
    ResourceSerializer
)
from .permissions import IsDistrictMasterTrainer, CanManageSession

class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingSessionSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageSession]

    def get_queryset(self):
        user = self.request.user
        
        # Optimize query by selecting related fields
        queryset = TrainingSession.objects.select_related(
            'ward', 
            'ward__lsgi', 
            'ward__lsgi__district',
            'created_by'
        )
        
        # 1. District Master Trainer: All sessions in their District
        if user.role == 'DISTRICT_MASTER_TRAINER':
            district = user.profile.district
            return queryset.filter(
                Q(ward__lsgi__district=district) | Q(created_by=user)
            ).distinct()
        
        # 2. LSGI Field Trainer: Only sessions explicitly assigned to them
        if user.role == 'LSGI_FIELD_TRAINER':
            # Show only sessions where this trainer is explicitly assigned
            return queryset.filter(
                assignments__trainer=user
            ).distinct()
            
        # 3. Citizen: Sessions in their Ward
        if user.role == 'CITIZEN':
             wards = user.profile.wards.all()
             # Also filter by Proficiency? SRS says "matching location and proficiency"
             # Assuming citizen has no proficiency field yet, filtering by Ward for now.
             return queryset.filter(ward__in=wards, status='SCHEDULED')

        # 4. Admins: Bound to their geography
        if user.role == 'LSGD_DISTRICT_ADMIN':
            return queryset.filter(ward__lsgi__district=user.profile.district)
            
        if user.role == 'LSGI_ADMIN':
            return queryset.filter(ward__lsgi=user.profile.lsgi)

        return queryset.none()

    def perform_create(self, serializer):
        # Additional enforcement: District Master Trainer OR District Admin OR LSGI Admin can create
        user = self.request.user
        
        if user.role not in ['DISTRICT_MASTER_TRAINER', 'LSGD_DISTRICT_ADMIN', 'LSGI_ADMIN']:
            raise PermissionDenied(f"Only District Master Trainers, District Admins, or LSGI Admins can create sessions. Your role is {user.role}")
        serializer.save(created_by=user)

class AssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = SessionAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsDistrictMasterTrainer] 

    def get_queryset(self):
        # Master Trainers and District Admins and LSGI Admins can manage assignments
        user = self.request.user
        if user.role in ['DISTRICT_MASTER_TRAINER', 'LSGD_DISTRICT_ADMIN']:
             if hasattr(user, 'profile') and user.profile.district:
                district = user.profile.district
                return SessionAssignment.objects.filter(session__ward__lsgi__district=district)
                
        if user.role == 'LSGI_ADMIN':
             if hasattr(user, 'profile') and user.profile.lsgi:
                lsgi = user.profile.lsgi
                return SessionAssignment.objects.filter(session__ward__lsgi=lsgi)

        return SessionAssignment.objects.none()

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Start with all, then filter down
        queryset = Attendance.objects.select_related('citizen', 'session').all()

        # Filter by Session ID if provided
        session_id = self.request.query_params.get('session')
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        
        # Filter by Date if provided (YYYY-MM-DD)
        date_str = self.request.query_params.get('date')
        if date_str:
            queryset = queryset.filter(marked_at__date=date_str)

        # Role-based filtering
        if user.role == 'LSGI_FIELD_TRAINER':
             # Can see attendance for sessions in their assigned filtered scope
             # Simplified: Sessions created by them or assigned to them?
             # Or sessions in their ward.
             if hasattr(user, 'profile') and user.profile.wards.exists():
                 wards = user.profile.wards.all()
                 return queryset.filter(
                    Q(session__assignments__trainer=user) | 
                    Q(session__ward__in=wards)
                ).distinct()
             return queryset.none()
        
        if user.role in ['DISTRICT_MASTER_TRAINER', 'LSGD_DISTRICT_ADMIN']:
             if hasattr(user, 'profile') and user.profile.district:
                 return queryset.filter(session__ward__lsgi__district=user.profile.district)

        return queryset

    @action(detail=False, methods=['post'], url_path='upload')
    def upload_attendance(self, request):
        file = request.FILES.get('file')
        session_id = request.data.get('session_id')
        
        if not file or not session_id:
            return Response({'error': 'File and session_id are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = TrainingSession.objects.get(id=session_id)
        except TrainingSession.DoesNotExist:
            return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            if file.name.endswith('.csv'):
                try:
                    df = pd.read_csv(file)
                except Exception:
                    # Fallback to simple read if encoding issues or whatever
                    file.seek(0)
                    df = pd.read_csv(file, encoding='latin1')
            elif file.name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file)
            else:
                return Response({'error': 'Unsupported file format. Use CSV or Excel.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f"Failed to read file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Normalize column names lower case for flexibility?
        # Let's check for standard headers: Name, Phone
        # Or map if needed. user data might not be perfect.
        
        # Check if 'Phone' column exists
        phone_col = next((col for col in df.columns if 'phone' in col.lower()), None)
        name_col = next((col for col in df.columns if 'name' in col.lower()), None)

        if not phone_col or not name_col:
             return Response({'error': "CSV/Excel must contain 'Name' and 'Phone' columns."}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        created_count = 0
        
        try:
            with transaction.atomic():
                for _, row in df.iterrows():
                    name = str(row[name_col]).strip()
                    phone = str(row[phone_col]).strip()
                    # Clean phone? Remove spaces?
                    phone = ''.join(filter(str.isdigit, phone))
                    
                    if not phone or len(phone) < 10: 
                        continue # Skip invalid phones

                    # Get or Create User (Citizen)
                    # We use phone as username for citizens in this flow usually
                    user, created = User.objects.get_or_create(
                        username=phone,
                        defaults={
                            'first_name': name,
                            'role': 'CITIZEN',
                            'phone': phone
                        }
                    )
                    
                    if created:
                        user.set_password('citizen@123') # Temp password
                        user.save()
                        # Create profile if needed
                        if not hasattr(user, 'profile'):
                            from profiles.models import UserProfile
                            UserProfile.objects.create(user=user)
                    
                    # Create Attendance
                    Attendance.objects.get_or_create(
                        session=session,
                        citizen=user,
                        defaults={'status': 'PRESENT'}
                    )
                    created_count += 1
        except Exception as e:
            return Response({'error': f"Error processing rows: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': f"Processed {created_count} attendees successfully."}, status=status.HTTP_201_CREATED)

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Resource.objects.all().order_by('-uploaded_at')

        # Filter by District logic
        if hasattr(user, 'profile') and user.profile.district:
            district = user.profile.district
            # Show resources uploaded by people in the same district (Master Trainers, Admins)
            return queryset.filter(uploaded_by__profile__district=district)
        
        # Fallback for superusers or state admins (show all?)
        if user.role in ['KSITM_SUPER_ADMIN', 'LSGD_STATE_ADMIN']:
            return queryset

        return queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ['DISTRICT_MASTER_TRAINER', 'LSGD_DISTRICT_ADMIN', 'LSGI_ADMIN']:
             raise PermissionDenied("You do not have permission to upload resources.")
        serializer.save(uploaded_by=user)

class StateAnalyticsViewSet(viewsets.ViewSet):
    """
    State-level analytics for LSGD State Admins
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """
        Get state-wide statistics:
        - Total attendance count
        - Total master trainers
        - Total field trainers
        - Total sessions
        - Total districts covered
        """
        user = request.user
        
        # Only State Admins and Super Admins can access state-level analytics
        if user.role not in ['LSGD_STATE_ADMIN', 'KSITM_SUPER_ADMIN']:
            raise PermissionDenied("Only State Admins can access state-level analytics.")
        
        User = get_user_model()
        
        # Total attendance across the state
        total_attendance = Attendance.objects.count()
        
        # Total unique citizens who attended
        unique_attendees = Attendance.objects.values('citizen').distinct().count()
        
        # Total Master Trainers
        master_trainers_count = User.objects.filter(role='DISTRICT_MASTER_TRAINER').count()
        
        # Total Field Trainers
        field_trainers_count = User.objects.filter(role='LSGI_FIELD_TRAINER').count()
        
        # Total sessions
        total_sessions = TrainingSession.objects.count()
        scheduled_sessions = TrainingSession.objects.filter(status='SCHEDULED').count()
        completed_sessions = TrainingSession.objects.filter(status='COMPLETED').count()
        
        # Districts covered
        from locations.models import District
        districts_with_sessions = TrainingSession.objects.values('ward__lsgi__district').distinct().count()
        total_districts = District.objects.count()
        
        # LSGIs covered
        lsgis_with_sessions = TrainingSession.objects.values('ward__lsgi').distinct().count()
        
        return Response({
            'attendance': {
                'total_attendance_records': total_attendance,
                'unique_citizens_attended': unique_attendees,
            },
            'trainers': {
                'master_trainers': master_trainers_count,
                'field_trainers': field_trainers_count,
                'total_trainers': master_trainers_count + field_trainers_count,
            },
            'sessions': {
                'total': total_sessions,
                'scheduled': scheduled_sessions,
                'completed': completed_sessions,
            },
            'coverage': {
                'districts_covered': districts_with_sessions,
                'total_districts': total_districts,
                'lsgis_covered': lsgis_with_sessions,
            }
        })

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    # GET /api/training/analytics/summary/ (Replaces dashboard)
    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        sessions = TrainingSession.objects.all()

        # Filtering logic based on Role
        if user.role in ['LSGD_STATE_ADMIN', 'KSITM_SUPER_ADMIN']:
            pass 
        elif user.role in ['LSGD_DISTRICT_ADMIN', 'DISTRICT_MASTER_TRAINER']:
            district = None
            if hasattr(user, 'profile'):
                if user.profile.district:
                    district = user.profile.district
                elif user.profile.lsgi:
                    district = user.profile.lsgi.district
            
            if district:
                sessions = sessions.filter(
                    Q(ward__lsgi__district=district) | 
                    Q(created_by=user)
                ).distinct()
            else:
                # If no district assigned, but they created sessions, show those?
                # Or just error. Stick to error for now if absolutely no context.
                if sessions.filter(created_by=user).exists():
                     sessions = sessions.filter(created_by=user)
                else: 
                     return Response({"error": "District not assigned"}, status=400)
        elif user.role == 'LSGI_ADMIN':
            if hasattr(user, 'profile') and user.profile.lsgi:
                sessions = sessions.filter(ward__lsgi=user.profile.lsgi)
            else:
                return Response({"error": "LSGI not assigned"}, status=400)
        else:
            return Response({"error": "Unauthorized for analytics"}, status=403)

        total_sessions = sessions.count()
        completed_sessions = sessions.filter(status='COMPLETED').count()
        upcoming_sessions = sessions.filter(status='SCHEDULED').count()
        
        # Total Attendees
        total_attendees = Attendance.objects.filter(session__in=sessions, status='PRESENT').count()
        
        # Wards Covered
        wards_covered = sessions.values('ward').distinct().count()
        
        # LSGIs Completed (for District/State admins)
        lsgis_completed = sessions.filter(status='COMPLETED').values('ward__lsgi').distinct().count()

        return Response({
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "upcoming_sessions": upcoming_sessions,
            "wards_covered": wards_covered,
            "total_attendees": total_attendees,
            "lsgis_completed": lsgis_completed,
        })

    # GET /api/training/analytics/trainers/
    @action(detail=False, methods=['get'])
    def trainers(self, request):
        user = request.user
        if user.role != 'DISTRICT_MASTER_TRAINER':
             return Response({"detail": "Permission denied."}, status=403)
             
        district = user.profile.district
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        from django.db.models import Count, Q
        
        # Get Field Trainers in this district
        # Filter by profile__lsgi__district
        trainers = User.objects.filter(
            role='LSGI_FIELD_TRAINER',
            profile__lsgi__district=district
        ).annotate(
            sessions_count=Count('assigned_sessions', distinct=True),
            attendees_count=Count('assigned_sessions__session__attendances', filter=Q(assigned_sessions__session__attendances__status='PRESENT'), distinct=True)
        )
        
        data = []
        for t in trainers:
            data.append({
                "id": t.id,
                "name": f"{t.first_name} {t.last_name}".strip() or t.username,
                "lsgi_name": t.profile.lsgi.name if t.profile and t.profile.lsgi else "Unassigned",
                "sessions_count": t.sessions_count,
                "attendees_count": t.attendees_count
            })
            
        return Response(data)

    # GET /api/training/analytics/{id}/attendees/
    @action(detail=True, methods=['get'], url_path='attendees')
    def trainer_attendees(self, request, pk=None):
        # View list of citizens trained by this trainer
        user = request.user
        if user.role != 'DISTRICT_MASTER_TRAINER':
             return Response({"detail": "Permission denied."}, status=403)

        # Verify trainer belongs to district
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            trainer = User.objects.get(pk=pk, role='LSGI_FIELD_TRAINER', profile__lsgi__district=user.profile.district)
        except User.DoesNotExist:
            return Response({"detail": "Trainer not found in your district."}, status=404)

        # Get attendees from sessions assigned to this trainer
        attendances = Attendance.objects.filter(
             session__assignments__trainer=trainer,
             status='PRESENT'
        ).select_related('citizen', 'session')
        
        data = []
        for att in attendances:
            data.append({
                "id": att.citizen.id,
                "name": f"{att.citizen.first_name} {att.citizen.last_name}".strip() or att.citizen.username,
                "phone": att.citizen.phone,
                "age": getattr(att.citizen, 'age', None), # age might be in profile or custom user? CustomUser has age.
                "session_name": att.session.title,
                "date": att.session.date_time
            })
            
        return Response(data)
