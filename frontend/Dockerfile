# Node.js 23 이미지 사용
FROM node:23

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사
COPY package.json yarn.lock ./

RUN yarn install

# 애플리케이션 소스 복사
COPY . .

# Vite 개발 서버 실행
CMD ["yarn", "dev"]
