# accounts/utils.py
import os
import mimetypes
from urllib.parse import urlparse
import requests
from django.core.files.base import ContentFile

def save_profile_picture(user, picture_url):
    """
    주어진 URL로부터 프로필 사진을 다운로드하여 사용자 객체의 profile_picture 필드에 저장합니다.
    - URL에서 확장자가 없으면 HTTP 응답 헤더의 Content-Type을 참고하여 확장자를 결정합니다.
    - WebP를 포함한 다양한 이미지 포맷을 지원합니다.
    """
    try:
        response = requests.get(picture_url)
        if response.status_code == 200:
            # URL에서 파일 경로를 분석하여 확장자 추출
            parsed_url = urlparse(picture_url)
            _, ext = os.path.splitext(parsed_url.path)
            if not ext:
                # URL에 확장자가 없으면 Content-Type 헤더로 확장자 유추
                content_type = response.headers.get("Content-Type")
                ext = mimetypes.guess_extension(content_type) if content_type else ".jpg"
            # 사용자 이메일 등을 기반으로 파일 이름 구성 (필요에 따라 sanitize 처리)
            filename = f"profile_{user.email}{ext}"
            # 기존 파일이 있다면 덮어씌우고, DB에 바로 반영
            user.profile_picture.save(filename, ContentFile(response.content), save=True)
    except Exception as e:
        print(f"프로필 사진 저장 중 오류 발생: {e}")
