from rest_framework import serializers
from .models import TrainingSession, SessionAssignment, Attendance, Resource
from locations.models import Ward
from locations.serializers import WardSerializer
from users.serializers import UserSerializer

class ResourceSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Resource
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'uploaded_at']

class TrainingSessionSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    is_assigned = serializers.SerializerMethodField()
    trainer_name = serializers.SerializerMethodField()

    resources = ResourceSerializer(many=True, read_only=True)
    trainer_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    attendees_count = serializers.SerializerMethodField()
    
    ward = WardSerializer(read_only=True)
    ward_id = serializers.PrimaryKeyRelatedField(
        queryset=Ward.objects.all(), source='ward', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = TrainingSession
        fields = '__all__'
        read_only_fields = ['created_by', 'status', 'is_assigned', 'trainer_name', 'resources', 'ward']

    def get_is_assigned(self, obj):
        return obj.assignments.exists()

    def get_trainer_name(self, obj):
        assignment = obj.assignments.first()
        if assignment:
            user = assignment.trainer
            return f"{user.first_name} {user.last_name}".strip() or user.username
        return None

    def get_attendees_count(self, obj):
        return obj.attendances.filter(status='PRESENT').count()

    def validate_ward_id(self, value):
        # Strict Geo Validation: Master Trainer can only create sessions in their District
        if not value:
            return value
            
        user = self.context['request'].user
        if user.role == 'DISTRICT_MASTER_TRAINER':
             user_district = user.profile.district
             ward_district = value.lsgi.district
             if user_district != ward_district:
                 raise serializers.ValidationError("You can only create sessions within your assigned District.")
        return value

    def create(self, validated_data):
        trainer_id = validated_data.pop('trainer_id', None)
        validated_data['created_by'] = self.context['request'].user
        
        from django.db import transaction
        with transaction.atomic():
            session = super().create(validated_data)
            
            if trainer_id:
                # Create assignment
                from django.contrib.auth import get_user_model
                from django.core.exceptions import ValidationError as DjangoValidationError
                User = get_user_model()
                try:
                    trainer = User.objects.get(id=trainer_id, role='LSGI_FIELD_TRAINER')
                    SessionAssignment.objects.create(session=session, trainer=trainer)
                except User.DoesNotExist:
                     raise serializers.ValidationError({"trainer_id": "Invalid Field Trainer ID."})
                except DjangoValidationError as e:
                     raise serializers.ValidationError({"detail": str(e)})
            
            return session

class SessionAssignmentSerializer(serializers.ModelSerializer):
    trainer_details = UserSerializer(source='trainer', read_only=True)
    session_details = TrainingSessionSerializer(source='session', read_only=True)

    class Meta:
        model = SessionAssignment
        fields = ['id', 'session', 'session_details', 'trainer', 'trainer_details', 'assigned_at']
        
    def validate(self, data):
        # Validate that Trainer belongs to valid geography for this session
        trainer = data['trainer']
        session = data['session']
        
        if trainer.role != 'LSGI_FIELD_TRAINER':
            raise serializers.ValidationError("Only LSGI Field Trainers can be assigned.")

        # STRICT RULE: Trainer's Ward (if set) must match, OR be in same LSGI
        trainer_profile = trainer.profile
        # STRICT RULE: Trainer's Ward (if set) must match, OR be in same LSGI
        trainer_profile = trainer.profile
        # Trainer has multiple wards now
        # Check if session ward is in trainer's wards
        if session.ward:
             if not trainer_profile.wards.filter(id=session.ward.id).exists():
                 # Check if ANY of the trainer's wards are in the same LSGI as session?
                 # Actually, SRS implies Field Trainer is bound to specific wards.
                 # Let's enforce strict ward match for this iteration as it's safest.
                 # Or check LSGI match if we allow cross-ward?
                 # The previous code checked "if trainer_profile.ward != session.ward".
                 # So let's stick to "Trainer MUST be assigned to this ward".
                 raise serializers.ValidationError(f"Trainer is not assigned to Ward {session.ward.name}.")
        
        return data

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
