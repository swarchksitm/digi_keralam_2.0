from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to Admin (Governance) roles.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [
            'KSITM_SUPER_ADMIN', 'LSGD_STATE_ADMIN', 'LSGD_DISTRICT_ADMIN', 
            'LSGD_BLOCK_ADMIN', 'LSGI_ADMIN'
        ]

class IsTrainerUser(permissions.BasePermission):
    """
    Allows access only to Trainer (Delivery) roles.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in [
            'STATE_SUPER_TRAINER', 'DISTRICT_MASTER_TRAINER', 
            'BLOCK_TRAINER', 'LSGI_FIELD_TRAINER'
        ]

class IsStrictlySameGeography(permissions.BasePermission):
    """
    Object-level permission to allow access only if the object belongs 
    to the same geography as the user.
    Assumes the object has 'district', 'block', 'lsgi', 'ward' attributes 
    OR is a UserProfile with those attributes.
    """
    def has_object_permission(self, request, view, obj):
        user_profile = getattr(request.user, 'profile', None)
        if not user_profile:
            return False
            
        # Example logic for District Admin
        if request.user.role == 'LSGD_DISTRICT_ADMIN':
            # Can access if object is in same district
            obj_district = getattr(obj, 'district', None)
            if not obj_district:
                # If object is a UserProfile, it might have district set
                return obj.district == user_profile.district
            return obj_district == user_profile.district
            
        # Add logic for other levels...
        return True # Default for now, needs expansion
