# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CrewAIRun
from channels.layers import get_channel_layer

@receiver(post_save, sender=CrewAIRun)
def crew_ai_run_status_updated(sender, instance, created, **kwargs):
    """
    CrewAIRun 객체의 status가 'completed'로 변경되었을 때 알림을 보냄
    """
    if not created and instance.status == 'completed':
        user_id = instance.user.id
        message = f"Your CrewAI task with ID {instance.id} has been completed."

        # WebSocket을 통해 메시지를 보냄
        channel_layer = get_channel_layer()
        channel_layer.group_send(
            f'notify_{user_id}',  # 사용자별 그룹 이름
            {
                'type': 'send_notification',  # WebSocket 소비자 메서드
                'message': message
            }
        )
