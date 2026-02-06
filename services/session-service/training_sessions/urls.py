from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SessionViewSet, AssignmentViewSet
from .analytics_views import AnalyticsViewSet

router = DefaultRouter()
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'assignments', AssignmentViewSet, basename='assignment')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
]
