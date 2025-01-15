import json
import asyncio
import websockets
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EchoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info("EchoConsumer: 연결 시도")
        await self.accept()

    async def disconnect(self, close_code):
        logger.info("EchoConsumer: 연결 종료")

    async def receive(self, text_data):
        logger.info(f"EchoConsumer: 받은 데이터 - {text_data}")
        await self.send(text_data=json.dumps({
            'message': text_data
        }))


class UpbitConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.symbol = self.scope['url_route']['kwargs']['symbol'].upper()
        self.group_name = f'upbit_{self.symbol}'

        # 그룹에 추가
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # 백그라운드 태스크로 WebSocket 연결
        self.fetch_task = asyncio.create_task(self.fetch_upbit_data())

    async def disconnect(self, close_code):
        # 그룹에서 제거
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

        # 백그라운드 태스크 취소
        if hasattr(self, 'fetch_task'):
            self.fetch_task.cancel()
            try:
                await self.fetch_task
            except asyncio.CancelledError:
                logger.info("Fetch task cancelled successfully.")

    async def fetch_upbit_data(self):
        uri = "wss://api.upbit.com/websocket/v1"
        subscribe_message = [
            {"ticket": "test"},
            {
                "type": "ticker",
                "codes": [self.symbol],
                "isOnlyRealtime": True
            }
        ]

        retries = 5  # 재시도 횟수 제한
        for attempt in range(retries):
            try:
                async with websockets.connect(uri) as websocket:
                    await websocket.send(json.dumps(subscribe_message))
                    logger.info(f"Subscribed to Upbit WebSocket for {self.symbol}")

                    async for message in websocket:
                        data = json.loads(message)

                        # 필요한 데이터 가공
                        processed_data = {
                            'symbol': self.symbol,
                            'trade_price': data.get('trade_price'),
                            'timestamp': datetime.fromtimestamp(data.get('timestamp') / 1000).isoformat(),
                            'signed_change_price': data.get('signed_change_price'),
                            'signed_change_rate': data.get('signed_change_rate'),
                            'trade_volume': data.get('trade_volume'),
                        }

                        # 클라이언트에게 데이터 전송
                        await self.channel_layer.group_send(
                            self.group_name,
                            {
                                'type': 'send_data',
                                'data': processed_data
                            }
                        )
            except Exception as e:
                logger.error(f"Error in Upbit WebSocket connection: {e}")
                if attempt < retries - 1:
                    logger.info("Retrying connection...")
                    await asyncio.sleep(5)
                else:
                    logger.error("Max retries reached, aborting connection.")
                    break

    async def send_data(self, event):
        data = event['data']
        await self.send(text_data=json.dumps(data))
