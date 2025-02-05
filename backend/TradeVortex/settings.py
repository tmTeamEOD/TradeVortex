from datetime import timedelta
from pathlib import Path

# Celery 설정
CELERY_BROKER_URL = 'redis://192.168.0.6:6379/0'  # Redis 브로커 URL
CELERY_RESULT_BACKEND = 'redis://192.168.0.6:6379/0'  # Redis를 결과 백엔드로 사용

# Celery 태스크 모듈
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Seoul'  # 시간대 설정

SECRET_KEY = 'imsuperior'

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings
DEBUG = True
ALLOWED_HOSTS = ['127.0.0.1', 'localhost','0.0.0.0','192.168.0.6']

STATIC_ROOT = "/app/staticfiles"  # 컨테이너 내의 경로로 설정
FRONTEND_URL = "http://192.168.0.6:3000"
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

NAVER_CLIENT_ID = "6FCM6gjsZc50se9DNYRp"
NAVER_CLIENT_SECRET = "FHA5n3PJ4X"
NAVER_REDIRECT_URI = "http://192.168.0.6:8000/api/accounts/naver/"
SOCIALACCOUNT_PROVIDERS = {
    'naver': {
        'APP': {
            'client_id': NAVER_CLIENT_ID,
            'secret': NAVER_CLIENT_SECRET,
            'key': '',
        }
    }
}
# Application definition
INSTALLED_APPS = [
    'financedata',
    'newspage',
    'toron',
    'calender',
    'channels',
    'graphs',
    'realtimechat',
    'django_filters',
    'freeboard',
    'accounts',
    'aiassist',
    'board',
    'corsheaders',
    'django_extensions',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
    'rest_framework',
    'rest_framework.authtoken',
    'dj_rest_auth',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.naver',  # 네이버 지원
    'allauth.socialaccount.providers.kakao',  # Custom Kakao provider

    'django.contrib.sites',
    'dj_rest_auth.registration',
    "rest_framework_simplejwt",  # djangorestframework-simplejwt
    # 'debug_toolbar',
]
ASGI_APPLICATION = 'TradeVortex.asgi.application'

REST_AUTH = {
    "TOKEN_MODEL": None,  # jwt token 쓸꺼임!, 이 경우 밑에 값이 무조건 True 거나 session 방식
    "USE_JWT": True,  # jwt token based auth를 위해 True
    "JWT_AUTH_HTTPONLY": False,  # refresh_token를 사용할 예정이라면, False로 설정을 바꿔야한다.
}
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # 'debug_toolbar.middleware.DebugToolbarMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',  # 이 줄을 주석 처리하거나 제거    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]
LANGUAGE_CODE = 'ko'

ROOT_URLCONF = 'TradeVortex.urls'

SESSION_ENGINE = "django.contrib.sessions.backends.db"  # 기본 설정 (DB에 세션 저장)
SESSION_COOKIE_HTTPONLY = False  # 보안 강화
SESSION_COOKIE_SECURE = False  # HTTPS가 아닌 경우 False (로컬 개발 환경)

# CSRF settings
CSRF_COOKIE_NAME = "XSRF-TOKEN"
CORS_ALLOW_CREDENTIALS = True  # CORS에서 자격 증명(쿠키) 허용
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False  # CSRF 토큰을 JavaScript에서 접근 가능하게
CSRF_TRUSTED_ORIGINS = [
    "http://0.0.0.0:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('redis', 6379)],  # Redis 호스트와 포트 설정
        },
    },
}

SESSION_COOKIE_SAMESITE = 'lax'
SESSION_COOKIE_SECURE = False
SESSION_COOKIE_HTTPONLY = False

# CORS settings
CORS_ALLOW_HEADERS = [
    "content-type",
    "authorization",
    "x-csrftoken",
    "accept",
    "accept-encoding",
    "origin",
    'user_id',  # 'user_id' 헤더 추가

]
CORS_ALLOW_ALL_ORIGINS = True
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
# ]

CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS",
]


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'bigdata28_p2_2',  # Database name
        'USER': 'mp_24k_bigdata28_p2_2',  # PostgreSQL user (psql 서비스에서 설정한 POSTGRES_USER와 동일해야 함)
        'PASSWORD': 'smhrd2',  # PostgreSQL password (psql 서비스에서 설정한 POSTGRES_PASSWORD와 동일해야 함)
        'HOST': 'mp.smhrd.or.kr',  # PostgreSQL 컨테이너 이름
        'PORT': '5432',  # PostgreSQL 기본 포트
    }
}






# JWT authentication settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=5),  # Access Token 유효기간
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),  # Refresh Token 유효기간
    'ROTATE_REFRESH_TOKENS': True,  # Refresh Token 갱신 시 새 Refresh Token 발급
    'BLACKLIST_AFTER_ROTATION': True,  # 이전 Refresh Token을 블랙리스트에 추가
    'ALGORITHM': 'HS256',  # 알고리즘
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),  # Authorization 헤더 타입
}

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "teameod417@gmail.com"  # Gmail 주소
EMAIL_HOST_PASSWORD = "fvxn ilqo fpvf wehu"  # Gmail 앱 비밀번호
DEFAULT_FROM_EMAIL = "teameod417@gmail.com"




# Custom user model and auth settings
ACCOUNT_USER_MODEL_USERNAME_FIELD = 'username'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
# ACCOUNT_ADAPTER = 'allauth.account.adapter.DefaultAccountAdapter'

AUTH_USER_MODEL = 'accounts.CustomUser'

# Debugging and logging
INTERNAL_IPS = ['127.0.0.1']

# Templates settings
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.csrf',  # CSRF 토큰을 처리하기 위한 컨텍스트 프로세서 추가

            ],
        },
    },
]

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# SOCIALACCOUNT_PROVIDERS = {
#     'google': {
#         'SCOPE': ['profile', 'email'],
#         'AUTH_PARAMS': {'access_type': 'online'},
#     }
# }

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
    'accounts.backends.EmailBackend',  # 이메일 인증
]

SITE_ID = 1

REST_USE_JWT = True
ACCOUNT_LOGOUT_ON_GET = True

# settings.py

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',  # DEBUG 로그 출력
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'DEBUG',  # DEBUG 레벨 로그를 출력
            'propagate': True,
        },
    },
}
import os

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

REST_AUTH_REGISTER_SERIALIZERS = {
    "REGISTER_SERIALIZER": "accounts.serializers.CustomRegisterSerializer",
}
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

ACCOUNT_SIGNUP_REDIRECT_URL = '/temp'  # 회원가입 후 리다이렉트 경로

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'ERROR',  # DEBUG로 설정
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'ERROR',  # DEBUG로 설정
            'propagate': True,
        },
    },
}
