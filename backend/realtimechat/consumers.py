import json
import logging
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

# 로깅 설정
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
# 콘솔 출력용 핸들러 설정
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# 실시간 채팅을 처리하는 WebSocket 소비자
class RealtimechatConsumers(AsyncWebsocketConsumer):
    # 클라이언트가 WebSocket에 연결할 때 호출됨
    async def connect(self):
        logger.info("실시간챗 연결 시도")

        # 그룹 이름을 단일 채널로 설정
        self.room_group_name = "chat_room"  # 단일 채팅 공간

        # 그룹에 채널 추가
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()  # 클라이언트 연결 허용
        logger.info(f"실시간챗 WebSocket 연결 성공, 채널 이름: {self.channel_name}")


    # 클라이언트가 WebSocket에서 연결 해제할 때 호출됨
    async def disconnect(self, close_code):
        logger.info(f"실시간챗 연결 종료, 종료 코드: {close_code}")

        if close_code != 1000:
            logger.error(f"WebSocket 비정상 종료, 코드: {close_code}. 연결이 끊어진 원인 파악 필요.")
        else:
            logger.info("정상적으로 연결 종료됨.")

        # 그룹에서 채널 제거
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        logger.info(f"실시간챗 WebSocket 종료 후 채널 제거 완료")


    # 클라이언트로부터 받은 메시지를 처리하는 함수
    async def receive(self, text_data):

        try:
            logger.info("receive 함수 실행됨")
            logger.info(f"실시간챗 메시지 수신 - 데이터: {text_data}")

            text_data_json = json.loads(text_data)
            message_id = text_data_json['id']
            sender = text_data_json['sender']
            message = text_data_json['text']
            time = text_data_json['time']

            logger.info(f"실시간챗 수신된 메시지 - ID: {message_id}, 사용자: {sender}, 메시지: {message}, 시간: {time}")

            # 단일 채팅 공간 내 모든 클라이언트에게 메시지 전송
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',  # 호출할 함수 이름
                    'id': message_id,        # 메시지 ID
                    'sender': sender,        # 메시지를 보낸 사용자
                    'message': message,      # 전송할 메시지
                    'time': time,            # 메시지 시간
                }
            )
        except json.JSONDecodeError as e:
            logger.error(f"JSON 디코딩 오류 발생: {e}")
        except KeyError as e:
            logger.error(f"필수 키 누락: {e}")
        except Exception as e:
            logger.error(f"메시지 처리 중 오류 발생: {e}")

    # 그룹 내 클라이언트에게 데이터를 전송하는 함수
    async def chat_message(self, event):
        try:
            message_id = event['id']
            sender = event['sender']
            message = event['message']
            time = event['time']

            logger.info(f"실시간챗 메시지 전송 - ID: {message_id}, 사용자: {sender}, 메시지: {message}, 시간: {time}")

            # 클라이언트에게 메시지 전송
            await self.send(text_data=json.dumps({
                'id': message_id,
                'sender': sender,
                'message': message,
                'time': time,
            }))
            logger.info(f"실시간챗 WebSocket으로 메시지 전송 완료 - ID: {message_id}, 사용자: {sender}, 메시지: {message}, 시간: {time}")

        except Exception as e:
            logger.error(f"메시지 전송 중 오류 발생: {e}")
