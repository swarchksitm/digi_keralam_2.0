from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings

class StatelessJWTAuthentication(JWTAuthentication):
    """
    Clients should authenticate by passing the token key in the "Authorization"
    HTTP header, prepended with the string specified in the settings. For example:

        Authorization: Bearer 401f7ac837da42b97f613d789819ff93537bee6a
    """

    def get_user(self, validated_token):
        """
        Returns a stateless User object based on the token payload.
        Steps:
        1. Extract user_id and other claims.
        2. Create a temporary User instance.
        3. Do NOT save to DB.
        """
        try:
            user_id = validated_token[settings.SIMPLE_JWT['USER_ID_CLAIM']]
        except KeyError:
            raise InvalidToken(_('Token contained no recognizable user identification'))

        User = get_user_model()
        user = User(id=user_id)
        
        # Populate other fields if available in token
        # For now, we assume role checks might need to be adjusted or role added to token
        # If token has 'role', set it.
        if 'role' in validated_token:
            user.role = validated_token['role']
            
        user.is_authenticated = True
        return user
