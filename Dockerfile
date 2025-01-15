# Python 3.12 베이스 이미지 사용
FROM python:3.12-slim

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 소스 복사
COPY . .

RUN crawl4ai-setup

# 정적 파일 수집
RUN python manage.py collectstatic --noinput

# Gunicorn과 Uvicorn을 함께 실행
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "TradeVortex.asgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
