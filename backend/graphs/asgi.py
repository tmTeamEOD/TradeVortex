import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import graphs.routing  # WebSocket 라우팅 파일

# Django 환경 변수 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TradeVortex.settings')

# Django 초기화 (필수)
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
