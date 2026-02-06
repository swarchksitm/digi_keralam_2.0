from rest_framework import serializers
from .models import TrainingSession, SessionAssignment

class TrainingSessionSerializer(serializers.ModelSerializer):
    created_by_id = serializers.IntegerField(read_only=True)
    is_assigned = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingSession
        fields = '__all__'
        read_only_fields = ['created_by_id', 'status', 'is_assigned']

    def get_is_assigned(self, obj):
        return obj.assignments.exists()

    def create(self, validated_data):
        # created_by_id field needs to be populated from request.user.id
        validated_data['created_by_id'] = self.context['request'].user.id
        return super().create(validated_data)

class SessionAssignmentSerializer(serializers.ModelSerializer):
    # We can't easily expand 'trainer' to full user details without API call or local data.
    # For now, simplistic approach: Return ID, Frontend fetches details if needed?
    # Or, we accept that 'trainer_details' might be empty or we need to fetch it via API (future task).
    # Removing 'trainer_details' source='trainer' because 'trainer' relation is gone. It's trainer_id.
    
    # If we want to show details, we need a method field that perhaps returns a placeholder or fetches it.
    trainer_id = serializers.IntegerField() # Explicitly define if needed, or ModelSerializer handles it.

    class Meta:
        model = SessionAssignment
        fields = ['id', 'session', 'trainer_id', 'assigned_at']
        
    def validate(self, data):
        # Basic validation only. Cross-service validation removed for decoupled architecture.
        # trainer_id = data['trainer_id']
        # We assume the ID is valid or validated by frontend.
        return data


