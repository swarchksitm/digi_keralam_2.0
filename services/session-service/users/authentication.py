from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings

class StatelessJWTAuthentication(JWTAuthentication):
    """
    Stateless JWT Authentication for Session Service.
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
            
        # Fetch Profile Context
        # We need the raw token. validated_token object might not allow re-encoding easily if it's a dict.
        # But JWTAuthentication passes ValidatedToken.
        # To make HTTP call, we need the raw string? 
        # validated_token is often a wrapper or dict.
        # In header 'Authorization: Bearer <token>'
        # We don't have the raw token string here easily unless we look at request.
        # Workaround: Skip Profile fetching here, do it in View?
        # NO, View expects user.profile.
        # Let's attach a helper method to user lazy-loading?
        
        user.token_payload = validated_token
        return user
