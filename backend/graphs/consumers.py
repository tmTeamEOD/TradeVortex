import json
import asyncio
import websockets
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime
import logging

# 로깅 설정
logger = logging.getLogger(__name__)

# 실시간으로 Upbit 데이터를 처리하는 WebSocket 소비자
class UpbitConsumer(AsyncWebsocketConsumer):
    # 클라이언트가 WebSocket에 연결할 때 호출됨
    async def connect(self):
        # WebSocket URL에서 심볼(symbol) 정보 추출
        self.symbol = self.scope['url_route']['kwargs']['symbol'].upper()
        self.group_name = f'upbit_{self.symbol}'  # 그룹 이름 생성

        # 그룹에 채널 추가
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()  # 클라이언트 연결 허용

        # WebSocket 데이터 수신을 위한 백그라운드 태스크 시작
        self.fetch_task = asyncio.create_task(self.fetch_upbit_data())

    # 클라이언트가 WebSocket에서 연결 해제할 때 호출됨
    async def disconnect(self, close_code):
        # 그룹에서 채널 제거
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

        # 백그라운드 태스크 종료
        if hasattr(self, 'fetch_task'):
            self.fetch_task.cancel()
            try:
                await self.fetch_task  # 태스크 취소 대기
            except asyncio.CancelledError:
                logger.info("Fetch task cancelled successfully.")  # 태스크 취소 성공 로그 출력

    # Upbit WebSocket에서 데이터를 가져오는 비동기 함수
    async def fetch_upbit_data(self):
        uri = "wss://api.upbit.com/websocket/v1"  # Upbit WebSocket URL
        subscribe_message = [  # 구독 메시지
            {"ticket": "test"},  # 인증 티켓
            {
                "type": "ticker",  # 데이터 타입 설정
                "codes": [self.symbol],  # 구독할 심볼
                "isOnlyRealtime": True  # 실시간 데이터만 요청
            }
        ]

        retries = 5  # 재시도 횟수
        for attempt in range(retries):
            try:
                # Upbit WebSocket에 연결
                async with websockets.connect(uri) as websocket:
                    # 구독 메시지 전송
                    await websocket.send(json.dumps(subscribe_message))
                    logger.info(f"Subscribed to Upbit WebSocket for {self.symbol}")

                    # WebSocket에서 메시지 수신
                    async for message in websocket:
                        data = json.loads(message)  # 수신 메시지 파싱

                        # 수신 데이터 가공
                        processed_data = {
                            'symbol': self.symbol,
                            'trade_price': data.get('trade_price'),  # 거래 가격
                            'timestamp': datetime.fromtimestamp(data.get('timestamp') / 1000).isoformat(),  # 타임스탬프
                            'signed_change_price': data.get('signed_change_price'),  # 가격 변화
                            'signed_change_rate': data.get('signed_change_rate'),  # 변화율
                            'trade_volume': data.get('trade_volume'),  # 거래량
                        }

                        # 그룹의 클라이언트들에게 데이터 전송
                        await self.channel_layer.group_send(
                            self.group_name,
                            {
                                'type': 'send_data',  # 호출할 함수 이름
                                'data': processed_data  # 전송할 데이터
                            }
                        )
            except Exception as e:
                logger.error(f"Error in Upbit WebSocket connection: {e}")  # 에러 로그 출력
                if attempt < retries - 1:  # 최대 재시도 횟수 이하일 경우 재연결
                    logger.info("Retrying connection...")
                    await asyncio.sleep(5)  # 재시도 전 대기
                else:
                    logger.error("Max retries reached, aborting connection.")  # 재시도 초과 로그
                    break

    # 그룹 내 클라이언트에게 데이터를 전송하는 함수
    async def send_data(self, event):
        data = event['data']  # 그룹에서 전송한 데이터
        await self.send(text_data=json.dumps(data))  # 클라이언트에게 데이터 전송
