from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from profiles.models import UserProfile

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['district', 'block', 'lsgi', 'ward', 'wards']
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
    password = serializers.CharField(write_only=True, required=False)
    district_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    lsgi_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    ward_id = serializers.IntegerField(write_only=True, required=False, allow_null=True, help_text="Residential Ward ID")
    ward_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False, allow_empty=True, help_text="Assigned Ward IDs for Trainers")
    age = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    highest_qualification = serializers.CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'password', 'district_id', 'lsgi_id', 'ward_id', 'ward_ids', 'first_name', 'last_name', 'age', 'highest_qualification']
        read_only_fields = ['id']

    def validate(self, data):
        role = data.get('role')
        district_id = data.get('district_id')
        lsgi_id = data.get('lsgi_id')
        ward_id = data.get('ward_id')
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

            # CRITICAL: Validate against Creator's Assigned Wards if Master Trainer
            request = self.context.get('request')
            request = self.context.get('request')
            if request and request.user and request.user.is_authenticated and request.user.role == User.Role.DISTRICT_MASTER_TRAINER:
                creator_profile = getattr(request.user, 'profile', None)
                if creator_profile and creator_profile.wards.exists():
                    allowed_ward_ids = list(creator_profile.wards.values_list('id', flat=True))
                    # Check if ALL selected wards are in allowed list
                    invalid_access = [w_id for w_id in ward_ids if w_id not in allowed_ward_ids]
                    if invalid_access:
                        raise serializers.ValidationError({"ward_ids": "You cannot assign wards that are not assigned to you."})

        if ward_id:
            from locations.models import Ward
            try:
                ward = Ward.objects.get(id=ward_id)
                if lsgi_id and ward.lsgi_id != lsgi_id:
                     raise serializers.ValidationError({"ward_id": "Residential Ward must belong to the selected LSGI."})
            except Ward.DoesNotExist:
                raise serializers.ValidationError({"ward_id": "Invalid Ward ID."})

        return data

    def create(self, validated_data):
        district_id = validated_data.pop('district_id', None)
        lsgi_id = validated_data.pop('lsgi_id', None)
        ward_id = validated_data.pop('ward_id', None)
        ward_ids = validated_data.pop('ward_ids', [])
        age = validated_data.pop('age', None)
        highest_qualification = validated_data.pop('highest_qualification', None)
        if not validated_data.get('password'):
            raise serializers.ValidationError({"password": "This field is required."})
        password = validated_data.pop('password')
        
        is_verified = validated_data.pop('is_verified', True)
        
        with transaction.atomic():
            user = User.objects.create_user(**validated_data)
            user.set_password(password)
            user.is_verified = is_verified
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
            
            if ward_id:
                from locations.models import Ward
                try:
                    ward = Ward.objects.get(id=ward_id)
                    profile.ward = ward
                    profile.save()
                except Ward.DoesNotExist:
                    raise serializers.ValidationError({"ward_id": "Invalid Ward ID"})

            if ward_ids:
                from locations.models import Ward
                wards = Ward.objects.filter(id__in=ward_ids)
                profile.wards.set(wards)
                profile.save()
            
            return user

    def update(self, instance, validated_data):
        district_id = validated_data.pop('district_id', None)
        lsgi_id = validated_data.pop('lsgi_id', None)
        ward_id = validated_data.pop('ward_id', None)
        ward_ids = validated_data.pop('ward_ids', None) # None implies no change if not sent, but for list it might be empty list
        age = validated_data.pop('age', None)
        highest_qualification = validated_data.pop('highest_qualification', None)
        password = validated_data.get('password') # Don't pop, handle separately

        with transaction.atomic():
            # Update User fields
            for attr, value in validated_data.items():
                if attr != 'password':
                    setattr(instance, attr, value)
            
            if password:
                instance.set_password(password)
            
            instance.save()

            # Update Profile
            profile = getattr(instance, 'profile', None)
            if not profile:
                from profiles.models import UserProfile
                profile = UserProfile.objects.create(user=instance)
            
            if age is not None:
                profile.age = age
            if highest_qualification is not None:
                profile.highest_qualification = highest_qualification
            
            # Update Location if provided
            if district_id:
                from locations.models import District
                profile.district = District.objects.get(id=district_id)
            
            if lsgi_id:
                from locations.models import LSGI
                profile.lsgi = LSGI.objects.get(id=lsgi_id)
                profile.district = profile.lsgi.district # Sync
            
            if ward_id:
                from locations.models import Ward
                profile.ward = Ward.objects.get(id=ward_id)

            # Update Wards Assignment
            if ward_ids is not None:
                from locations.models import Ward
                wards = Ward.objects.filter(id__in=ward_ids)
                profile.wards.set(wards)
            
            profile.save()
            
            return instance
