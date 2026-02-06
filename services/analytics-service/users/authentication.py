from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth import get_user_model
from django.conf import settings

class StatelessJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token[settings.SIMPLE_JWT['USER_ID_CLAIM']]
        except KeyError:
            raise InvalidToken(('Token contained no recognizable user identification'))

        User = get_user_model()
        user = User(id=user_id)
        
        if 'role' in validated_token:
            user.role = validated_token['role']
            
        user.token_payload = validated_token
        return user
