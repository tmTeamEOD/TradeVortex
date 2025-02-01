from django.urls import path
from aiassist.views import CrewAIRunView,ChatBotView, \
    CrewAIRecommendView

urlpatterns = [
    path('run/', CrewAIRunView.as_view(), name='crewai_run'),  # Crew 실행
    path('bot/', ChatBotView.as_view(), name='crewai_replay'),  # Crew 태스크 재실행
    path('recommend/', CrewAIRecommendView.as_view(), name='crew_ai_recommend'),  # 추천 API

]
