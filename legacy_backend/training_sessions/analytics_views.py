from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import TrainingSession

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        user = request.user
        
        # Base QuerySet
        sessions = TrainingSession.objects.all()

        # Filtering logic based on Role
        if user.role == 'LSGD_STATE_ADMIN':
            # State Admin sees all, aggregated by District
            pass # No filter needed initially
        elif user.role == 'LSGD_DISTRICT_ADMIN':
            # District Admin sees only their district
            if hasattr(user, 'profile') and user.profile.district:
                sessions = sessions.filter(ward__lsgi__district=user.profile.district)
            else:
                return Response({"error": "District not assigned"}, status=400)
        else:
            return Response({"error": "Unauthorized for analytics"}, status=403)

        # Calculate KPIs
        total_sessions = sessions.count()
        completed_sessions = sessions.filter(status='COMPLETED').count()
        
        # Coverage: Count unique Wards that have at least one session
        wards_covered = sessions.values('ward').distinct().count()

        return Response({
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "wards_covered": wards_covered,
        })
