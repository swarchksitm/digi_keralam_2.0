from rest_framework import permissions

class IsDistrictMasterTrainer(permissions.BasePermission):
    """
    Allows access only to District Master Trainers.
    Used for creating sessions.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'DISTRICT_MASTER_TRAINER'

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
    Strict object-level permission for managing sessions.
    - Master Trainer: Can manage sessions in their District.
    - Field Trainer: Read-only, or update status if assigned.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # 1. District Master Trainer: specific to their District
        if user.role == 'DISTRICT_MASTER_TRAINER':
            # Strict Geo-Check: Session Ward -> LSGI -> District vs User District
            # Assuming obj is TrainingSession
            session_district = obj.ward.lsgi.district
            user_district = user.profile.district
            return session_district == user_district
        
        # 2. Field Trainer: Read-only or update if assigned
        if user.role == 'LSGI_FIELD_TRAINER':
             if request.method in permissions.SAFE_METHODS:
                 # Visibility logic handled in QuerySet, but double check here
                 return True
             # Write: Only allowed if assigned to this session
             return obj.assignments.filter(trainer=user).exists()

        return False
