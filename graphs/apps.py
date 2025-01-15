from django.apps import AppConfig
from .utils import start_upbit_ws

class GraphsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'

    name = 'graphs'

    def ready(self):
        symbols = ['BTC', 'ETH']  # 모니터링할 심볼 리스트
        for symbol in symbols:
            start_upbit_ws(symbol)