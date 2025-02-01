import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import graphs.routing  # 실제 라우팅 파일
import realtimechat.routing  # 실시간채팅 라우팅파일
import aiassist.routing  # AI 어시스트 알림 라우팅 파일

# Django 환경 변수 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TradeVortex.settings')

# Django 초기화
django.setup()

# ASGI 애플리케이션 정의
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            graphs.routing.websocket_urlpatterns  # Chart 웹소켓
            + realtimechat.routing.websocket_urlpatterns  # 실시간챗 웹소켓
            + aiassist.routing.websocket_urlpatterns  # AI 어시스트 알림 웹소켓
        )
    ),
})
