from django.urls import path
from aiassist.views import CrewAIRunView, CrewAITrainView, CrewAITestView, CrewAIReplayView, ChatBotView

urlpatterns = [
    path('run/', CrewAIRunView.as_view(), name='crewai_run'),  # Crew 실행
    path('train/', CrewAITrainView.as_view(), name='crewai_train'),  # Crew 학습
    path('test/', CrewAITestView.as_view(), name='crewai_test'),  # Crew 테스트
    path('replay/', CrewAIReplayView.as_view(), name='crewai_replay'),  # Crew 태스크 재실행
    path('bot/', ChatBotView.as_view(), name='crewai_replay'),  # Crew 태스크 재실행

]
