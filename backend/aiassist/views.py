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
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from .models import CrewAIRun


class CrewAIRunView(APIView):
    """
    API View to run the Crew and send notifications with recommendations.
    """

    def get(self, request, *args, **kwargs):
        return Response({"message": "Crew AI Run Endpoint Ready!"}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        # 요청 본문에서 inputs 가져오기
        inputs = request.data.get("inputs", {})

        # 헤더에서 user_id와 Authorization 토큰 가져오기
        user_id = request.headers.get("user_id")
        authorization = request.headers.get("Authorization")

        if not user_id:
            return Response({"error": "User ID가 헤더에 포함되지 않았습니다."}, status=status.HTTP_400_BAD_REQUEST)

        if not authorization:
            return Response({"error": "Authorization 토큰이 헤더에 포함되지 않았습니다."}, status=status.HTTP_400_BAD_REQUEST)

        # Authorization 토큰 처리 (예: JWT 검증)
        token = authorization.split(" ")[1]  # "Bearer <token>" 형태일 경우
        try:
            # JWT 검증 (JWT 검증 로직 추가 필요)
            # 여기서는 검증을 생략하고 토큰만 추출하는 예시를 보입니다.
            pass
        except Exception as e:
            raise AuthenticationFailed("Invalid token")

        # user_id에 해당하는 사용자 가져오기
        try:
            user = get_user_model().objects.get(id=user_id)
        except get_user_model().DoesNotExist:
            return Response({"error": "유저를 찾을 수 없습니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # AI 작업을 시작하기 전에 CrewAIRun 객체 생성
            crew_ai_run = CrewAIRun.objects.create(
                inputs=inputs,
                result={},  # 임시로 빈 JSON 객체로 result 필드 채우기
                status='pending',  # 초기 상태는 '대기중'
                user=user  # user_id로 사용자 연결
            )

            # 작업을 비동기적으로 Celery에서 처리하도록 호출
            run_crew_ai_task.delay(inputs, user_id, crew_ai_run.id)

            return Response({
                "message": "AI 어시스트 작업이 시작되었습니다. 완료되면 알림을 받을 것입니다.",
                "run_id": crew_ai_run.id,  # 생성된 run_id 반환
                "user_id": user_id,
                "status": crew_ai_run.status  # 현재 상태 반환
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_status(self, request, *args, **kwargs):
        run_id = request.data.get("run_id")

        try:
            # 해당 run_id의 상태를 확인
            crew_ai_run = CrewAIRun.objects.get(id=run_id)
            if crew_ai_run.status == 'completed':
                return Response({
                    "message": "AI 작업이 완료되었습니다.",
                    "result": crew_ai_run.result
                }, status=status.HTTP_200_OK)
            elif crew_ai_run.status == 'running':
                return Response({
                    "message": "AI 작업이 진행 중입니다.",
                    "status": "running"
                }, status=status.HTTP_202_ACCEPTED)
            else:
                return Response({
                    "message": "AI 작업이 대기 중입니다.",
                    "status": "pending"
                }, status=status.HTTP_202_ACCEPTED)
        except CrewAIRun.DoesNotExist:
            return Response({"error": "해당 AI 작업을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)


# views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CrewAIRun

class AiTaskResultView(APIView):
    """
    AI 작업 결과 조회 API.
    완료된 작업 결과를 반환합니다.
    """

    def get(self, request, *args, **kwargs):
        run_id = request.query_params.get('run_id')  # 쿼리 파라미터로 run_id 받기

        if not run_id:
            return Response({"error": "run_id가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            crew_ai_run = CrewAIRun.objects.get(id=run_id)
        except CrewAIRun.DoesNotExist:
            return Response({"error": "해당 AI 작업을 찾을 수 없습니다."}, status=status.HTTP_404_NOT_FOUND)

        # 작업 상태에 따라 결과 반환
        if crew_ai_run.status == 'completed':
            return Response({
                "message": "AI 작업이 완료되었습니다.",
                "result": crew_ai_run.result  # 결과 반환
            }, status=status.HTTP_200_OK)
        elif crew_ai_run.status == 'running':
            return Response({
                "message": "AI 작업이 진행 중입니다.",
                "status": "running"
            }, status=status.HTTP_202_ACCEPTED)
        else:
            return Response({
                "message": "AI 작업이 대기 중입니다.",
                "status": "pending"
            }, status=status.HTTP_202_ACCEPTED)

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

# views.py
from rest_framework import generics, permissions
from .models import CrewAIRun
from .serializers import CrewAIRunSerializer

class CrewAIRunHistoryView(generics.ListAPIView):
    """
    로그인한 사용자의 Crew AI 작업 히스토리를 반환합니다.
    """
    serializer_class = CrewAIRunSerializer
    permission_classes = [permissions.IsAuthenticated]  # 로그인한 사용자만 접근 가능

    def get_queryset(self):
        # 현재 로그인한 사용자의 히스토리를 최신순으로 조회합니다.
        return CrewAIRun.objects.filter(user=self.request.user).order_by('-id')
