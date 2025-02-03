from rest_framework import generics
from .models import Event
from .serializers import EventSerializer

# 이벤트 목록 조회 및 생성
class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

# 개별 이벤트 조회, 수정, 삭제
class EventRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
