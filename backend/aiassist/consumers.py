# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # URL에서 user_id 추출
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'notify_{self.user_id}'  # 사용자별 그룹 이름 생성

        # 그룹에 참가
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # 연결 승인
        await self.accept()

    async def disconnect(self, close_code):
        # 그룹에서 나가기
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # 그룹에서 메시지 수신
    async def receive(self, text_data):
        # 클라이언트로부터 받은 메시지를 처리
        print(f"Received message: {text_data}")  # 디버깅 로그

        # 받은 메시지를 같은 그룹의 다른 클라이언트에게 전달
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'send_notification',  # 이벤트 처리 타입
                'message': text_data  # 받은 메시지
            }
        )

    # 그룹에서 메시지가 왔을 때 클라이언트로 전달
    async def send_notification(self, event):
        message = event['message']

        # 클라이언트에게 메시지 전송
        await self.send(text_data=json.dumps({
            'message': message
        }))
