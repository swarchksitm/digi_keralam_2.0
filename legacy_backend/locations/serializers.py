from rest_framework import serializers
from .models import District, Block, LSGI, Ward

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = '__all__'

class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = '__all__'

class LSGISerializer(serializers.ModelSerializer):
    # Optional fields for creating an LSGI Admin simultaneously
    admin_username = serializers.CharField(write_only=True, required=False)
    admin_password = serializers.CharField(write_only=True, required=False)
    admin_email = serializers.EmailField(write_only=True, required=False)
    admin_phone = serializers.CharField(write_only=True, required=False)

    admin_info = serializers.SerializerMethodField()

    class Meta:
        model = LSGI
        fields = '__all__'

    def get_admin_info(self, obj):
        from profiles.models import UserProfile
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Find profile linked to this LSGI where user is LSGI_ADMIN
        profile = UserProfile.objects.filter(
            lsgi=obj, 
            user__role=User.Role.LSGI_ADMIN
        ).first()
        
        if profile and profile.user:
            return {
                "username": profile.user.username,
                "phone": getattr(profile.user, 'phone', 'N/A')
            }
        return None

    def create(self, validated_data):
        # Extract admin data
        admin_username = validated_data.pop('admin_username', None)
        admin_password = validated_data.pop('admin_password', None)
        admin_email = validated_data.pop('admin_email', '')
        admin_phone = validated_data.pop('admin_phone', None)

        from django.contrib.auth import get_user_model
        from django.db import transaction
        from profiles.models import UserProfile

        User = get_user_model()

        with transaction.atomic():
            # 1. Create LSGI
            lsgi = LSGI.objects.create(**validated_data)

            # 2. Create Admin (if credentials provided)
            if admin_username and admin_password:
                if User.objects.filter(username=admin_username).exists():
                    raise serializers.ValidationError({"admin_username": "Username already taken."})
                
                user = User.objects.create_user(
                    username=admin_username,
                    email=admin_email,
                    password=admin_password,
                    role=User.Role.LSGI_ADMIN,
                    phone=admin_phone,
                    is_verified=True
                )
                
                # 3. Create Profile & Link to LSGI
                # Check if profile exists (signal might create it), otherwise create/update
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile.lsgi = lsgi
                profile.district = lsgi.district
                profile.block = lsgi.block
                profile.save()

            return lsgi

class WardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ward
        fields = '__all__'
