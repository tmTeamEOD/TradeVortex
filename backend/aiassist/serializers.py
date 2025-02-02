# serializers.py
from rest_framework import serializers
from .models import CrewAIRun

class CrewAIRunSerializer(serializers.ModelSerializer):
    # created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)  # 생성일자 포맷 지정

    class Meta:
        model = CrewAIRun
        fields = [
            'id',
            'inputs',
            'result',
            'status',
            'recommendations',
            'user_id',
        ]
