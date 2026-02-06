from rest_framework import serializers
from .models import District, Block, LSGI, Ward

class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = '__all__'

class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = '__all__'

class LSGISerializer(serializers.ModelSerializer):
    class Meta:
        model = LSGI
        fields = '__all__'

class WardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ward
        fields = '__all__'
