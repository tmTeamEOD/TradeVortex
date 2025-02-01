from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/notify_(?P<user_id>\d+)/$', consumers.NotificationConsumer.as_asgi()),
]
