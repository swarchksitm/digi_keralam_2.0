from rest_framework import serializers
from .models import TrainingSession, SessionAssignment, Attendance
from locations.models import Ward
from users.serializers import UserSerializer

class TrainingSessionSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    is_assigned = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingSession
        fields = '__all__'
        read_only_fields = ['created_by', 'status', 'is_assigned']

    def get_is_assigned(self, obj):
        return obj.assignments.exists()

    def validate_ward(self, value):
        # Strict Geo Validation: Master Trainer can only create sessions in their District
        user = self.context['request'].user
        if user.role == 'DISTRICT_MASTER_TRAINER':
             user_district = user.profile.district
             ward_district = value.lsgi.district
             if user_district != ward_district:
                 raise serializers.ValidationError("You can only create sessions within your assigned District.")
        return value

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class SessionAssignmentSerializer(serializers.ModelSerializer):
    trainer_details = UserSerializer(source='trainer', read_only=True)

    class Meta:
        model = SessionAssignment
        fields = ['id', 'session', 'trainer', 'trainer_details', 'assigned_at']
        
    def validate(self, data):
        # Validate that Trainer belongs to valid geography for this session
        trainer = data['trainer']
        session = data['session']
        
        if trainer.role != 'LSGI_FIELD_TRAINER':
            raise serializers.ValidationError("Only LSGI Field Trainers can be assigned.")

        # STRICT RULE: Trainer's Ward (if set) must match, OR be in same LSGI
        trainer_profile = trainer.profile
        if trainer_profile.ward and trainer_profile.ward != session.ward:
             raise serializers.ValidationError(f"Trainer is bound to {trainer_profile.ward}, cannot be assigned to {session.ward}")
        
        return data

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
