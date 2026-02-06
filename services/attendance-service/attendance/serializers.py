from rest_framework import serializers
from .models import Attendance

class AttendanceSerializer(serializers.ModelSerializer):
    marked_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = ['id', 'session_id', 'citizen_id', 'status', 'marked_at', 'marked_by_id', 'marked_by_name']
        read_only_fields = ['marked_at', 'marked_by_id']

    def get_marked_by_name(self, obj):
        # Optimization: Don't fetch name for every row if possible?
        # Or leave null for now to avoid N+1 API calls.
        return f"Trainer {obj.marked_by_id}" if obj.marked_by_id else "Unknown"
        
        return data

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
