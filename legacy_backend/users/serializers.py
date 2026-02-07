from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from profiles.models import UserProfile

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['district', 'block', 'lsgi', 'ward']
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

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'password', 'district_id', 'first_name', 'last_name']
        read_only_fields = ['id']

    def validate(self, data):
        role = data.get('role')
        district_id = data.get('district_id')

        # Validation logic for hierarchy
        if role == User.Role.LSGD_DISTRICT_ADMIN and not district_id:
            raise serializers.ValidationError({"district_id": "District is required for District Admin."})

        return data

    def create(self, validated_data):
        district_id = validated_data.pop('district_id', None)
        password = validated_data.pop('password')
        
        with transaction.atomic():
            user = User.objects.create_user(**validated_data)
            user.set_password(password)
            user.is_verified = True
            user.save()

            # Create Profile
            profile = UserProfile.objects.create(user=user)
            if district_id:
                from locations.models import District
                try:
                    profile.district = District.objects.get(id=district_id)
                    profile.save()
                except District.DoesNotExist:
                    raise serializers.ValidationError({"district_id": "Invalid District ID"})
            
            return user
