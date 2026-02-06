from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings

class StatelessJWTAuthentication(JWTAuthentication):
    """
    Stateless JWT Authentication for Attendance Service.
    Does NOT query the database. Creates a transient User object.
    """

    def get_user(self, validated_token):
        try:
            user_id = validated_token[settings.SIMPLE_JWT['USER_ID_CLAIM']]
        except KeyError:
            raise InvalidToken(('Token contained no recognizable user identification'))

        User = get_user_model()
        # Create ephemeral user
        user = User(id=user_id)
        
        # Populate fields if available in token
        if 'role' in validated_token:
            user.role = validated_token['role']
        if 'username' in validated_token:
            user.username = validated_token['username']
            
        user.token_payload = validated_token
        return user
