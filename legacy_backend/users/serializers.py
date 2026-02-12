from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from profiles.models import UserProfile

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['district', 'block', 'lsgi', 'wards']
        depth = 1

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'profile']
        read_only_fields = ['role', 'profile']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['role'] = user.role
        token['username'] = user.username
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra user data to response
        data['role'] = self.user.role
        data['username'] = self.user.username
        data['id'] = self.user.id
        
        return data

# ... existing imports ...
from django.db import transaction

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    district_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    lsgi_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    ward_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False, allow_empty=True)
    age = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    highest_qualification = serializers.CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'password', 'district_id', 'lsgi_id', 'ward_ids', 'first_name', 'last_name', 'age', 'highest_qualification']
        read_only_fields = ['id']

    def validate(self, data):
        role = data.get('role')
        district_id = data.get('district_id')
        lsgi_id = data.get('lsgi_id')
        ward_ids = data.get('ward_ids', [])

        # Validation logic for hierarchy
        if role == User.Role.LSGD_DISTRICT_ADMIN and not district_id:
            raise serializers.ValidationError({"district_id": "District is required for District Admin."})

        if role == User.Role.LSGI_FIELD_TRAINER and not lsgi_id:
            raise serializers.ValidationError({"lsgi_id": "LSGI is required for Field Trainer."})
            
        if ward_ids and lsgi_id:
            from locations.models import Ward
            wards = Ward.objects.filter(id__in=ward_ids)
            if len(wards) != len(ward_ids):
                raise serializers.ValidationError({"ward_ids": "Some Ward IDs are invalid."})
            
            for ward in wards:
                if ward.lsgi_id != lsgi_id:
                    raise serializers.ValidationError({"ward_ids": f"Ward {ward.name} does not belong to the selected LSGI."})

        return data

    def create(self, validated_data):
        district_id = validated_data.pop('district_id', None)
        lsgi_id = validated_data.pop('lsgi_id', None)
        ward_ids = validated_data.pop('ward_ids', [])
        age = validated_data.pop('age', None)
        highest_qualification = validated_data.pop('highest_qualification', None)
        password = validated_data.pop('password')
        
        with transaction.atomic():
            user = User.objects.create_user(**validated_data)
            user.set_password(password)
            user.is_verified = True
            user.save()

            # Create Profile
            profile = UserProfile.objects.create(user=user, age=age, highest_qualification=highest_qualification)
            
            if district_id:
                from locations.models import District
                try:
                    profile.district = District.objects.get(id=district_id)
                    profile.save()
                except District.DoesNotExist:
                    raise serializers.ValidationError({"district_id": "Invalid District ID"})
            
            if lsgi_id:
                from locations.models import LSGI
                try:
                    lsgi = LSGI.objects.get(id=lsgi_id)
                    profile.lsgi = lsgi
                    # Always sync district with LSGI for consistency
                    profile.district = lsgi.district
                    profile.save()
                except LSGI.DoesNotExist:
                     raise serializers.ValidationError({"lsgi_id": "Invalid LSGI ID"})
            
            if ward_ids:
                from locations.models import Ward
                wards = Ward.objects.filter(id__in=ward_ids)
                profile.wards.set(wards)
                profile.save()
            
            return user
