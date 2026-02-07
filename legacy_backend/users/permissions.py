
from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()

class IsKsitSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == User.Role.KSITM_SUPER_ADMIN

class IsStateAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == User.Role.LSGD_STATE_ADMIN

class IsDistrictAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == User.Role.LSGD_DISTRICT_ADMIN
