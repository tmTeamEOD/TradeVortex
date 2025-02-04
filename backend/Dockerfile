# Python 3.12 베이스 이미지 사용
FROM python:3.12
# 필수 패키지 및 Rust 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgeos-dev \
    curl \
    && curl https://sh.rustup.rs -sSf | sh -s -- -y \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.cargo/bin:${PATH}"
# JDK 설치
RUN apt-get update && \
    apt-get install -y default-jdk && \
    rm -rf /var/lib/apt/lists/*

# JAVA_HOME 설정 (설치된 JDK 경로에 맞게 수정)
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"
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
