import redis
import json
import asyncio
from aiassist.models import CrewAIRun
from crewai.tasks.output_format import OutputFormat
from crewai.tasks.task_output import TaskOutput
from crewai.types.usage_metrics import UsageMetrics
from celery import shared_task
from channels.layers import get_channel_layer
from .main import run  # 같은 디렉토리 내에 있을 경우

# Redis 클라이언트 설정
redis_client = redis.StrictRedis(host='redis', port=6379, db=0, decode_responses=True)


# WebSocket 알림을 비동기적으로 보내는 함수
async def send_notification(user_id, message):
    print(f"About to send notification to notify_{user_id}: {message}")  # 디버깅 로그

    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        f'notify_{user_id}',
        {
            'type': 'send_notification',
            'message': message,
        }
    )


@shared_task
def run_crew_ai_task(inputs, user_id, run_id):
    try:
        # CrewAI 실행
        print(f"Running CrewAI task for run_id: {run_id}")
        run_result = run(inputs)

        if hasattr(run_result, 'raw'):
            raw_data = run_result.raw
            redis_client.set(f'crew_ai_result:{run_id}', raw_data)  # Redis에 raw 데이터만 저장

        # 작업 완료 후 바로 Redis에서 DB로 결과 저장
        save_result_to_db(run_id)

        # 작업 완료 후 알림 보내기
        print(f"Sending notification for run_id: {run_id}")

        # 비동기 함수 실행을 위해 asyncio.run 사용
        asyncio.run(send_notification(user_id, f'AI 분석 서비스 작업이 완료되었습니다. 결과를 확인하세요! 보고서 ID: {run_id}'))

        return run_id  # 작업 성공 시, run_id 반환

    except Exception as e:
        return str(e)


# Redis에서 데이터를 가져와 DB에 저장하는 함수
def save_result_to_db(run_id):
    try:
        # Redis에서 결과 가져오기 (raw 데이터만)
        raw_data = redis_client.get(f'crew_ai_result:{run_id}')

        if raw_data:
            # raw 데이터를 CrewAIRun 객체의 결과로 저장
            crew_ai_run = CrewAIRun.objects.get(id=run_id)
            crew_ai_run.result = raw_data  # 저장된 raw 데이터로 업데이트
            crew_ai_run.status = 'completed'  # 상태 업데이트
            crew_ai_run.save()

            # Redis에서 해당 키 삭제 (옵션)
            redis_client.delete(f'crew_ai_result:{run_id}')

            return f"Run {run_id} result saved to DB."
        else:
            return f"No result found for run_id {run_id}."

    except Exception as e:
        return str(e)
