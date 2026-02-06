from django.urls import path
from .views import AttendanceSessionView, FeedbackSessionView

urlpatterns = [
    path('attendance/<int:session_id>/', AttendanceSessionView.as_view(), name='attendance-session'),
    path('feedback/<int:session_id>/', FeedbackSessionView.as_view(), name='feedback-session'),
]
