from rest_framework import serializers
from .models import Asset, OHLCV

# 투자자산 시리얼라이저
class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'

# OHLCV 시리얼라이저
class OHLCVSerializer(serializers.ModelSerializer):
    asset = serializers.StringRelatedField()  # 자산 이름으로 변환

    class Meta:
        model = OHLCV
        fields = '__all__'
