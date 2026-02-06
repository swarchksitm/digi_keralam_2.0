from django.urls import path
from .views import DistrictListView, BlockListView, LSGIListView, WardListView

urlpatterns = [
    path('districts/', DistrictListView.as_view(), name='district_list'),
    path('blocks/', BlockListView.as_view(), name='block_list'),
    path('lsgis/', LSGIListView.as_view(), name='lsgi_list'),
    path('wards/', WardListView.as_view(), name='ward_list'),
]
