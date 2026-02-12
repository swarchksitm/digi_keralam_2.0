from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SessionViewSet, AssignmentViewSet, AttendanceViewSet, ResourceViewSet, StateAnalyticsViewSet, AnalyticsViewSet
# from .analytics_views import AnalyticsViewSet

router = DefaultRouter()
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')
router.register(r'state-analytics', StateAnalyticsViewSet, basename='state-analytics')

urlpatterns = [
    path('', include(router.urls)),
]
