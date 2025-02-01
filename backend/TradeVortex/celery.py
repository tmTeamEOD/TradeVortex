from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Django 설정 파일 경로 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TradeVortex.settings')

# Celery 애플리케이션 객체 생성
app = Celery('TradeVortex')

# Celery 설정을 Django 설정 파일에서 가져오기
app.config_from_object('django.conf:settings', namespace='CELERY')

# 자동으로 tasks 모듈 찾기
app.autodiscover_tasks()
