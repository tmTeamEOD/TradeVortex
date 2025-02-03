import os
import json
import uuid
import logging
import requests
from PIL import Image
from io import BytesIO
from django.conf import settings
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from asgiref.sync import sync_to_async
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy
import asyncio
from functools import wraps
from urllib.parse import urlparse

# 로깅 설정
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# 환경 변수에서 API 키 불러오기
API_KEY = os.getenv("GEMINI_API_KEY")

# 크롤링할 뉴스 URL 설정 (환경 변수 또는 settings.py 활용)
NEWS_SOURCE_URL = getattr(settings, "NEWS_SOURCE_URL", "https://finance.yahoo.com/")

# Gemini API URL 설정
LLM_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent"

# 미디어 폴더 경로 설정
MEDIA_ROOT = os.path.join(settings.MEDIA_ROOT, "news_images")
os.makedirs(MEDIA_ROOT, exist_ok=True)

# 캐시된 이미지 다운로드 경로를 저장하는 딕셔너리
image_cache = {}

def retry_on_failure(retries=3, delay=3):
    """실패 시 재시도하는 데코레이터"""

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    logger.error(f"시도 {attempt + 1} 실패: {e}")
                    if attempt < retries - 1:
                        await asyncio.sleep(delay)
                    else:
                        raise e

        return wrapper

    return decorator


class NewsItem:
    def __init__(self, title: str, content: str, url: str):
        self.title = title
        self.content = content
        self.url = url

    def to_dict(self):
        return {
            "title": self.title,
            "content": self.content,
            "url": self.url,
        }


class CrawlNewsView(APIView):
    """비동기 뉴스 크롤링 및 LLM 가공을 수행하는 API"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 뉴스 URL 초기화
        self.page_url = NEWS_SOURCE_URL

    @method_decorator(csrf_exempt)
    def get(self, request):
        """뉴스 크롤링 실행 후 JSON 응답 반환"""
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(self.fetch_news())
        return JsonResponse({"news": result}, safe=False)

    async def fetch_news(self):
        """첫 번째 크롤링: 뉴스 제목, 내용, 링크 가져오기"""
        llm_strategy = LLMExtractionStrategy(
            provider="gemini/gemini-2.0-flash-exp",
            api_token=API_KEY,
            schema=json.dumps({
                "title": "string",
                "content": "string",
                "url": "string"
            }),
            extraction_type="schema",
            instruction="""
            뉴스 기사 페이지에서 다음 정보를 추출해주세요:
            1. 제목 (title): 뉴스 기사의 제목을 추출합니다. 한글로 매력적인 문장으로 합니다.
            2. 내용 (content): 뉴스 기사의 본문을 매력적으로 요약해서 추출합니다. 한글로 매력적인 문장으로 합니다.
            3. URL (url): 뉴스 기사의 URL을 추출합니다.
            """,
            chunk_token_threshold=1000,
            overlap_rate=0.0,
            apply_chunking=True,
            input_format="html",
            extra_args={"temperature": 0.0, "max_tokens": 800}
        )

        crawl_config = CrawlerRunConfig(
            extraction_strategy=llm_strategy,
            cache_mode=CacheMode.BYPASS,
        )

        browser_cfg = BrowserConfig(headless=True)

        async with AsyncWebCrawler(config=browser_cfg) as crawler:
            result = await crawler.arun(url=self.page_url, config=crawl_config)

            if not result.success:
                logger.error(f"첫 번째 크롤링 실패: {result.error_message}")
                return None

            # 결과가 JSON 형태일 경우 파싱
            try:
                extracted_content = json.loads(result.extracted_content)
                articles = []
                for item in extracted_content:
                    title = item.get("title")
                    content = item.get("content")
                    url = item.get("url")

                    # 첫 번째 크롤링의 URL이 뉴스 홈페이지와 같다면 제외
                    if url == NEWS_SOURCE_URL:
                        logger.debug(f"뉴스 홈페이지 URL 제외: {url}")
                        continue  # 뉴스 홈페이지 URL 제외

                    # URL이 비어있지 않으며 유효한 URL인지 확인
                    if not url or not self.is_valid_url(url):
                        logger.error(f"유효하지 않은 URL: {url}")
                        continue  # 유효하지 않은 URL이면 건너뛰기

                    # 두 번째 크롤링: URL에서 이미지 추출
                    image_url = await self.extract_image_from_page(url)
                    local_image_path = None
                    if image_url:
                        # 이미지 URL이 JSON 배열인 경우 첫 번째 이미지 URL만 추출
                        try:
                            image_json = json.loads(image_url)  # 이미지 URL이 JSON 형식으로 제공될 수 있으므로 이를 파싱
                            image_url = image_json[0].get("image") if isinstance(image_json, list) else None
                        except (json.JSONDecodeError, TypeError):
                            logger.error(f"이미지 URL 파싱 오류: {image_url}")

                        # 이미지 URL 유효성 검사
                        if image_url and (image_url.startswith("http") or image_url.startswith("https")):
                            local_image_path = await self.download_image(image_url)
                        else:
                            logger.error(f"유효하지 않은 이미지 URL: {image_url}")

                    # 최종 결과에 제목, 내용, 이미지 경로, URL 포함 (URL은 포함)
                    articles.append({
                        "title": title,
                        "content": content,
                        "image": local_image_path,  # 로컬 이미지 경로
                        "url": url,  # 기사 URL 포함
                    })

                return articles
            except (json.JSONDecodeError, TypeError):
                logger.error(f"크롤링 결과 오류: 반환된 데이터가 올바른 JSON 형식이 아닙니다.")
                return None

    def is_valid_url(self, url):
        """URL이 유효한지 체크하는 함수"""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])  # URL이 scheme과 netloc을 포함하는지 확인
        except Exception as e:
            logger.error(f"URL 파싱 오류: {e}")
            return False

    @retry_on_failure(retries=3)
    async def extract_image_from_page(self, page_url):
        """뉴스 페이지에서 이미지 URL 추출"""
        llm_strategy = LLMExtractionStrategy(
            provider="gemini/gemini-2.0-flash-exp",
            api_token=API_KEY,
            schema=json.dumps({
                "image": "string"
            }),
            extraction_type="schema",
            instruction=f"""
            해당 뉴스 기사의 페이지 ({page_url}) 에서 기사 안에 첨부된 중요한 딱 한장의 이미지의 저장 가능한 경로를 추출해주세요.
            가능한 고화질 이미지를 추출하고, 이미지 저장 가능한 URL을 반환해주세요.
            """,
            chunk_token_threshold=1000,
            overlap_rate=0.0,
            apply_chunking=True,
            input_format="html",
            extra_args={"temperature": 0.0, "max_tokens": 800}
        )

        crawl_config = CrawlerRunConfig(
            extraction_strategy=llm_strategy,
            cache_mode=CacheMode.BYPASS,
        )

        browser_cfg = BrowserConfig(headless=True)

        async with AsyncWebCrawler(config=browser_cfg) as crawler:
            result = await crawler.arun(url=page_url, config=crawl_config)

            if not result.success:
                logger.error(f"이미지 추출 실패: {result.error_message}")
                return None

            return result.extracted_content.strip() if result.extracted_content else None

    async def download_image(self, image_url):
        """이미지를 다운로드하여 로컬 저장 후 파일 경로 반환"""
        if image_url in image_cache:
            logger.debug(f"캐시된 이미지 사용: {image_url}")
            return image_cache[image_url]

        try:
            logger.debug(f"이미지 다운로드 시작: {image_url}")
            response = await asyncio.to_thread(requests.get, image_url, stream=True, timeout=5)
            if response.status_code == 200:
                img = Image.open(BytesIO(response.content))
                img = img.convert("RGB")

                file_ext = os.path.splitext(image_url.split("?")[0])[1] or ".jpg"
                file_name = f"{uuid.uuid4()}{file_ext}"
                file_path = os.path.join(MEDIA_ROOT, file_name)

                img.save(file_path, quality=95)
                image_cache[image_url] = f"/media/news_images/{file_name}"
                logger.debug(f"이미지 다운로드 완료: {file_path}")
                return f"/media/news_images/{file_name}"
            else:
                logger.error(f"이미지 다운로드 실패: {response.status_code}")
        except requests.RequestException as e:
            logger.error(f"이미지 다운로드 오류: {e}")
        return None
