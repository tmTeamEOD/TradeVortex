# your_app/routing.py

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/upbit/(?P<symbol>[\w-]+)/$', consumers.UpbitConsumer.as_asgi()),

]
