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
    queryset = LSGI.objects.all()
    serializer_class = LSGISerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    
    def get_queryset(self):
        queryset = LSGI.objects.all()
        user = self.request.user

        # Role-based filtering
        if user.is_authenticated:
            # Avoid circular import if possible, or use string check/User model
            # For simplicity and robustness, we check the role string
            if user.role == 'LSGD_DISTRICT_ADMIN' and hasattr(user, 'profile') and user.profile.district:
                queryset = queryset.filter(district=user.profile.district)

        block_id = self.request.query_params.get('block')
        district_id = self.request.query_params.get('district')
        if block_id:
            queryset = queryset.filter(block_id=block_id)
        elif district_id:
            queryset = queryset.filter(district_id=district_id)
        return queryset

class LSGIDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LSGI.objects.all()
    serializer_class = LSGISerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        queryset = LSGI.objects.all()
        user = self.request.user
        if user.is_authenticated:
             if user.role == 'LSGD_DISTRICT_ADMIN' and hasattr(user, 'profile') and user.profile.district:
                queryset = queryset.filter(district=user.profile.district)
        return queryset

class WardListView(generics.ListAPIView):
    queryset = Ward.objects.all()
    serializer_class = WardSerializer
    permission_classes = (permissions.AllowAny,)
    
    def get_queryset(self):
        queryset = Ward.objects.all()
        lsgi_id = self.request.query_params.get('lsgi')
        if lsgi_id:
            queryset = queryset.filter(lsgi_id=lsgi_id)
        return queryset
