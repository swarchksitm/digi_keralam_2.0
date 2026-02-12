from rest_framework import permissions

class IsDistrictMasterTrainer(permissions.BasePermission):
    """
    Allows access to District Master Trainers OR District Admins.
    Used for creating sessions and managing assignments.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['DISTRICT_MASTER_TRAINER', 'LSGD_DISTRICT_ADMIN', 'LSGI_ADMIN']

class IsLSGIFieldTrainer(permissions.BasePermission):
    """
    Allows access only to LSGI Field Trainers.
    Used for being assigned to sessions.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'LSGI_FIELD_TRAINER'

class CanManageSession(permissions.BasePermission):
    """
    Strict permission for managing sessions.
    - Master Trainer / District Admin: Can manage sessions in their District.
    - LSGI Admin: Can manage sessions in their LSGI.
    - Field Trainer: Read-only, or update status if assigned.
    """
    def has_permission(self, request, view):
        # Allow Listing and Creating if authenticated (further filtered by QuerySet)
        if not request.user or not request.user.is_authenticated:
            return False
            
        # District Admin / Master Trainer / LSGI Admin can always access (Create/List)
        if request.user.role in ['DISTRICT_MASTER_TRAINER', 'LSGD_DISTRICT_ADMIN', 'LSGI_ADMIN']:
            return True
            
        # Others (Field Trainer, Citizen) can access (List/Retrieve) if logic permits
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # 1. District Master Trainer OR District Admin: specific to their District
        if user.role in ['DISTRICT_MASTER_TRAINER', 'LSGD_DISTRICT_ADMIN']:
            if not obj.ward:
                 # If no ward (e.g. pending/draft), allow if created by this user?
                 # Or deny?
                 # Let's check created_by
                 return obj.created_by == user
            session_district = obj.ward.lsgi.district
            if not hasattr(user, 'profile') or not user.profile.district:
                return False
            return session_district == user.profile.district

        # 2. LSGI Admin: specific to their LSGI
        if user.role == 'LSGI_ADMIN':
            session_lsgi = obj.ward.lsgi
            if not hasattr(user, 'profile') or not user.profile.lsgi:
                return False
            return session_lsgi == user.profile.lsgi
        
        # 2. Field Trainer: Read-only or update if assigned
        if user.role == 'LSGI_FIELD_TRAINER':
             if request.method in permissions.SAFE_METHODS:
                 # Visibility logic handled in QuerySet, but double check here
                 return True
             # Write: Only allowed if assigned to this session
             return obj.assignments.filter(trainer=user).exists()

        return False
