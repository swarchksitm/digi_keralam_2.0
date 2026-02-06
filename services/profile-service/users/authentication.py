from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class StatelessJWTAuthentication(JWTAuthentication):
    """
    Stateless JWT with Just-In-Time (JIT) Provisioning for Profile Service.
    Uses the token to authenticate AND sync the User record in the local DB.
    """

    def get_user(self, validated_token):
        """
        1. Extract user_id.
        2. Get or Create user in local DB.
        3. Return user.
        """
        try:
            user_id = validated_token[settings.SIMPLE_JWT['USER_ID_CLAIM']]
        except KeyError:
            raise InvalidToken(('Token contained no recognizable user identification'))

        User = get_user_model()
        
        # Claims from Token (Assuming standard SimpleJWT or customized via Auth Service)
        # Note: Standard SimpleJWT access token might ONLY have user_id.
        # If it doesn't have fields like 'username', 'role', we can't fully sync.
        # But 'auth-service' usually puts defaults?
        # If fields are missing in token, we might fail to create a valid user?
        # User model requires username.
        
        # Let's try to get the user first.
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            # User doesn't exist locally. Need to create.
            # We need username at least.
            username = validated_token.get('username') or validated_token.get('sub') or f"user_{user_id}"
            email = validated_token.get('email', '')
            role = validated_token.get('role', 'CITIZEN') # Default field?
            
            logger.info(f"JIT Provisioning User {user_id} ({username})")
            user = User.objects.create(
                id=user_id,
                username=username,
                email=email,
                role=role,
                is_active=True
            )
            # Set password unusable?
            user.set_unusable_password()
            user.save()
            
        # Ensure Profile Exists
        # Import inside method to avoid circular import if necessary
        from profiles.models import UserProfile
        if not hasattr(user, 'profile'):
            UserProfile.objects.create(user=user)
            
        return user
