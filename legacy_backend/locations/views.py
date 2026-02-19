from rest_framework import generics, permissions
from .models import District, Block, LSGI, Ward
from .serializers import DistrictSerializer, BlockSerializer, LSGISerializer, WardSerializer

class DistrictListView(generics.ListAPIView):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = (permissions.AllowAny,)

class BlockListView(generics.ListAPIView):
    queryset = Block.objects.all()
    serializer_class = BlockSerializer
    permission_classes = (permissions.AllowAny,)
    filterset_fields = ['district']

    def get_queryset(self):
        queryset = Block.objects.all()
        district_id = self.request.query_params.get('district')
        if district_id:
            queryset = queryset.filter(district_id=district_id)
        return queryset

class LSGIListView(generics.ListCreateAPIView):
    queryset = LSGI.objects.select_related('district', 'block').all()
    serializer_class = LSGISerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    
    def get_queryset(self):
        queryset = LSGI.objects.select_related('district', 'block').all()
        user = self.request.user

        # Role-based filtering
        if user.is_authenticated:
            # Avoid circular import if possible, or use string check/User model
            # For simplicity and robustness, we check the role string
            if user.role == 'LSGD_DISTRICT_ADMIN' and hasattr(user, 'profile') and user.profile.district:
                queryset = queryset.filter(district=user.profile.district)

        block_id = self.request.query_params.get('block')
        district_id = self.request.query_params.get('district')
        lsgi_type = self.request.query_params.get('lsgi_type')

        if block_id:
            queryset = queryset.filter(block_id=block_id)
        if district_id:
            queryset = queryset.filter(district_id=district_id)
        if lsgi_type:
            queryset = queryset.filter(lsgi_type=lsgi_type)
            
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'LSGD_DISTRICT_ADMIN':
            # Force district to match admin's district
            if not (hasattr(user, 'profile') and user.profile.district):
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"detail": "District Admin has no assigned district."})
            serializer.save(district=user.profile.district)
        else:
            serializer.save()

class LSGIDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LSGI.objects.select_related('district', 'block').all()
    serializer_class = LSGISerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        queryset = LSGI.objects.select_related('district', 'block').all()
        user = self.request.user
        if user.is_authenticated:
             if user.role == 'LSGD_DISTRICT_ADMIN' and hasattr(user, 'profile') and user.profile.district:
                queryset = queryset.filter(district=user.profile.district)
        return queryset

class WardListView(generics.ListAPIView):
    queryset = Ward.objects.select_related('lsgi', 'lsgi__district').all()
    serializer_class = WardSerializer
    permission_classes = (permissions.AllowAny,)
    
    def get_queryset(self):
        queryset = Ward.objects.select_related('lsgi', 'lsgi__district').all()
        lsgi_id = self.request.query_params.get('lsgi')
        if lsgi_id:
            queryset = queryset.filter(lsgi_id=lsgi_id)
        else:
            # Safety: Do not return all wards if no LSGI is specified
            queryset = queryset.none()
        return queryset
