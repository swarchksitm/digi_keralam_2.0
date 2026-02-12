from django.contrib import admin
from .models import TrainingSession, SessionAssignment, Attendance, Resource

admin.site.register(TrainingSession)
admin.site.register(SessionAssignment)
admin.site.register(Attendance)
admin.site.register(Resource)
