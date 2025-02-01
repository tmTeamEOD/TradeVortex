import os

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from aiassist.main import run, train, test, replay  # CrewAI 실행 메서드 가져오기
from dotenv import load_dotenv
from .tasks import run_crew_ai_task  # Celery 작업 임포트

env_path = os.path.join(os.path.dirname(__file__), 'crew/src', '..', '.env')  # 프로젝트 루트 기준 경로
load_dotenv(dotenv_path=env_path)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CrewAIRun
from .tasks import run_crew_ai_task  # Celery 작업 임포트

class CrewAIRunView(APIView):
    """
    API View to run the Crew and send notifications with recommendations.
    """
    def get(self, request, *args, **kwargs):
        return Response({"message": "Crew AI Run Endpoint Ready!"}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        inputs = request.data.get("inputs", {})
        user_id = request.data.get("userid",{})  # 헤더에서 user.id 가져오기

        if not user_id:
            return Response({"error": "User ID가 헤더에 포함되지 않았습니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # AI 작업을 시작하기 전에 미리 CrewAIRun 객체 생성
            crew_ai_run = CrewAIRun.objects.create(
                inputs=inputs,
                result="",  # 임시로 빈 문자열로 result 필드 채우기
                status='pending',  # 초기 상태는 '대기중'
            )

            # 작업을 비동기적으로 Celery에서 처리하도록 호출
            # user.id와 crew_ai_run.id를 전달
            run_crew_ai_task.delay(inputs, user_id, crew_ai_run.id)

            return Response({
                "message": "AI 어시스트 작업이 시작되었습니다. 완료되면 알림을 받을 것입니다.",
                "run_id": crew_ai_run.id,  # 생성된 run_id 반환
                "user_id": user_id
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CrewAIRun

class CrewAIRecommendView(APIView):
    """
    API View to increase recommendation count for a specific AI run.
    """
    def post(self, request, *args, **kwargs):
        run_id = request.data.get("run_id")
        try:
            # 추천할 AI 작업 ID 찾기
            crew_ai_run = CrewAIRun.objects.get(id=run_id)
            crew_ai_run.recommendations += 1  # 추천 수 증가
            crew_ai_run.save()

            # 실시간 추천 수 업데이트
            send_recommendation_update(crew_ai_run.user.id, crew_ai_run.recommendations)

            return Response({"message": "추천이 완료되었습니다.", "recommendations": crew_ai_run.recommendations}, status=status.HTTP_200_OK)
        except CrewAIRun.DoesNotExist:
            return Response({"error": "해당 AI 작업을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)



from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from aiassist.chatbotmain import response as chat  # ChatBotCrew를 임포트 (위에서 작성한 파일)


class ChatBotView(APIView):
    """
    API View to interact with the ChatBot.
    """

    def get(self, request, *args, **kwargs):
        return Response({"message": "ChatBot Endpoint Ready!"}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        inputs = request.data.get("inputs", {})
        try:
            # Call the run method with dynamic inputs
            run_result = chat(inputs)
            return Response({"message": "Crew run successfully!", "result": run_result}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
