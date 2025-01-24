import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import graphs.routing  # 실제 라우팅 파일

# Django 환경 변수 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TradeVortex.settings')

# Django 초기화
django.setup()

# ASGI 애플리케이션 정의
application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # HTTP 요청 처리
    "websocket": AuthMiddlewareStack(
        URLRouter(
            graphs.routing.websocket_urlpatterns  # WebSocket URL 라우팅
        )
    ),
})
