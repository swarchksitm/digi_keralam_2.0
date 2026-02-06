from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        return Response({
            "total_sessions": 0,
            "completed_sessions": 0,
            "wards_covered": 0,
        })

    @action(detail=False, methods=['get'])
    def state(self, request):
        return Response([])

    @action(detail=False, methods=['get'])
    def district(self, request):
        return Response([])
        
    @action(detail=False, methods=['get'])
    def block(self, request):
        return Response([])
