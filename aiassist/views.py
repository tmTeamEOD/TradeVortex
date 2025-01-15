import os

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from aiassist.main import run, train, test, replay  # CrewAI 실행 메서드 가져오기
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), 'crew/src', '..', '.env')  # 프로젝트 루트 기준 경로
load_dotenv(dotenv_path=env_path)

class CrewAIRunView(APIView):
    """
    API View to run the Crew.
    """
    def get(self, request, *args, **kwargs):
        return Response({"message": "Crew Run Endpoint Ready!"}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        inputs = request.data.get("inputs", {})
        try:
            # Call the run method with dynamic inputs
            run_result = run(inputs)
            return Response({"message": "Crew run successfully!", "result": run_result}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CrewAITrainView(APIView):
    """
    API View to train the Crew.
    """
    def get(self, request, *args, **kwargs):
        return Response({"message": "Crew Train Endpoint Ready!"}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        n_iterations = request.data.get("n_iterations", 1)
        filename = request.data.get("filename", "training_output.json")
        inputs = request.data.get("inputs", {"topic": "AI LLMs"})
        try:
            # Call the train method with dynamic parameters
            result = train(n_iterations=n_iterations, filename=filename, inputs=inputs)
            return Response({"message": result}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CrewAITestView(APIView):
    """
    API View to test the Crew.
    """
    def get(self, request, *args, **kwargs):
        return Response({"message": "Crew Test Endpoint Ready!"}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        n_iterations = request.data.get("n_iterations", 1)
        openai_model_name = request.data.get("openai_model_name", "text-davinci-003")
        inputs = request.data.get("inputs", {"topic": "AI LLMs"})
        try:
            # Call the test method with dynamic parameters
            test_result = test(n_iterations=n_iterations, openai_model_name=openai_model_name, inputs=inputs)
            return Response({"message": "Crew tested successfully!", "result": test_result}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CrewAIReplayView(APIView):
    """
    API View to replay the Crew from a specific task.
    """
    def get(self, request, *args, **kwargs):
        return Response({"message": "Crew Replay Endpoint Ready!"}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        task_id = request.data.get("task_id")
        try:
            # Call the replay method
            result = replay(task_id=task_id)
            return Response({"message": result}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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
