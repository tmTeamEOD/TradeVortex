# your_app/utils.py

import asyncio
import websockets
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

UPBIT_WS_URL = "wss://api.upbit.com/websocket/v1"


async def upbit_ws_consumer(symbol):
    async with websockets.connect(UPBIT_WS_URL) as websocket:
        subscribe_format = [
            {"ticket": "test"},
            {"type": "ticker", "codes": [f"CRIX.UPBIT.KRW-{symbol}"]},
            # 필요한 다른 타입 추가 가능 (예: trade, orderbook 등)
        ]
        await websocket.send(json.dumps(subscribe_format))

        channel_layer = get_channel_layer()
        group_name = f'financial_data_{symbol}'

        while True:
            try:
                message = await websocket.recv()
                data = json.loads(message)

                # 필요한 데이터 추출 (예: 현재 가격, 시간 등)
                trade_price = data.get('trade_price')
                timestamp = data.get('timestamp')  # 밀리초 단위
                datetime_obj = timezone.datetime.fromtimestamp(timestamp / 1000, tz=timezone.utc)

                # 데이터베이스에 저장
                FinancialData.objects.update_or_create(
                    symbol=f"KRW-{symbol}",
                    timestamp=datetime_obj,
                    defaults={
                        'open': data.get('opening_price', trade_price),
                        'high': data.get('high_price', trade_price),
                        'low': data.get('low_price', trade_price),
                        'close': trade_price,
                        'volume': data.get('acc_trade_volume', 0),
                        'asset_type': 'CRYPTO',
                    }
                )

                # 실시간 데이터 브로드캐스트
                await channel_layer.group_send(
                    group_name,
                    {
                        'type': 'send_financial_data',
                        'data': {
                            'x': datetime_obj.isoformat(),
                            'y': [data.get('opening_price', trade_price),
                                  data.get('high_price', trade_price),
                                  data.get('low_price', trade_price),
                                  trade_price],
                        }
                    }
                )
            except Exception as e:
                print(f"Error in WebSocket connection: {e}")
                await asyncio.sleep(5)  # 재연결 시도 전 대기
                continue


def start_upbit_ws(symbol):
    loop = asyncio.get_event_loop()
    loop.create_task(upbit_ws_consumer(symbol))
