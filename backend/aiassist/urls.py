from django.urls import path
from aiassist.views import CrewAIRunView, ChatBotView, \
    CrewAIRecommendView, AiTaskResultView, CrewAIRunHistoryView

urlpatterns = [
    path('run/', CrewAIRunView.as_view(), name='crewai_run'),  # Crew 실행
    path('bot/', ChatBotView.as_view(), name='crewai_replay'),  # Crew 태스크 재실행
    path('recommend/', CrewAIRecommendView.as_view(), name='crew_ai_recommend'),  # 추천 API
    path('result/', AiTaskResultView.as_view(), name='ai-task-result'),  # 결과 조회 경로
    path('history/', CrewAIRunHistoryView.as_view(), name='crewai-history'),

]
