import os
import uuid
import json
import logging
import requests
import asyncio
from io import BytesIO
from urllib.parse import urlparse
from PIL import Image
from functools import wraps
import random

from django.conf import settings
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy

# 로깅 설정
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# 환경 변수에서 API 키 불러오기
API_KEY = os.getenv("GEMINI_API_KEY")

# 후보 뉴스 사이트 목록
CANDIDATE_SITES = [
    "https://finance.yahoo.com/",
    "https://www.bloomberg.com/markets",
    "https://www.reuters.com/finance",
    "https://www.marketwatch.com/",
    "https://www.cnbc.com/",
    "https://www.wsj.com/finance",
    "https://www.ft.com/markets",
    "https://www.nytimes.com/section/business",
    "https://www.forbes.com/markets/",
    "https://www.businessinsider.com/finance",
    "https://www.theguardian.com/business",
    "https://www.independent.co.uk/topic/business",
    "https://www.aljazeera.com/economy/",
    "https://www.economist.com/finance-and-economics",
    "https://www.bbc.com/news/business",
    "https://www.tradingeconomics.com/",
    "https://www.abc.net.au/news/business/",
    "https://www.reuters.com/business",
    "https://www.nikkei.com/markets/",
    "https://www.cnbc.com/world/",
]

# 미디어 폴더 경로 설정
MEDIA_ROOT = os.path.join(settings.MEDIA_ROOT, "news_images")
os.makedirs(MEDIA_ROOT, exist_ok=True)

# 캐시된 이미지 다운로드 경로
image_cache = {}

# User-Agent 리스트
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36",
]

def get_random_headers():
    return {"User-Agent": random.choice(USER_AGENTS)}

def retry_on_failure(retries=3, delay=3):
    """비동기 함수 실패 시 재시도하는 데코레이터"""
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

# API 호출 및 외부 요청에 대한 동시 실행 제한 및 딜레이를 위한 전역 세마포어와 딜레이 시간 (초)
api_semaphore = asyncio.Semaphore(1)
API_DELAY = 5  # 초

async def auto_select_sources():
    """
    후보 뉴스 사이트 중 HEAD 요청 또는 GET 요청으로 정상 응답(200)을 받은 사이트를 선정합니다.
    RSS 피드, 업데이트 빈도, 방문자 수 등 추가 로직을 추후 도입할 수 있습니다.
    """
    selected = []

    async def check_site(url):
        try:
            async with api_semaphore:
                headers = get_random_headers()
                response = await asyncio.to_thread(requests.head, url, headers=headers, timeout=3)
            await asyncio.sleep(API_DELAY)
            if response.status_code == 200:
                logger.debug(f"HEAD 체크 통과: {url}")
                selected.append(url)
                return
            else:
                logger.debug(f"HEAD 체크 실패({url}) status: {response.status_code}")
        except Exception as e:
            logger.error(f"HEAD 요청 오류({url}): {e}")

        # HEAD 실패 시 GET 요청 시도 (대역폭 낭비를 감수하고 재시도)
        try:
            async with api_semaphore:
                headers = get_random_headers()
                response = await asyncio.to_thread(requests.get, url, headers=headers, timeout=5)
            await asyncio.sleep(API_DELAY)
            if response.status_code == 200:
                logger.debug(f"GET 체크 통과: {url}")
                selected.append(url)
        except Exception as e:
            logger.error(f"GET 요청 오류({url}): {e}")

    tasks = [check_site(url) for url in CANDIDATE_SITES]
    await asyncio.gather(*tasks)

    if not selected:
        logger.warning("모든 후보 사이트 체크 실패 - 기본값 사용")
        return [CANDIDATE_SITES[0]]
    return selected

def is_valid_url(url):
    try:
        result = urlparse(url)
        return result.scheme in ("http", "https")
    except Exception:
        return False

@retry_on_failure(retries=3, delay=2)
async def extract_image_from_page(page_url):
    """
    주어진 뉴스 페이지에서 대표 이미지 URL을 추출합니다.
    Gemini API를 통해 고화질 이미지 URL을 한글 뉴스 기사에 적합하게 요청합니다.
    """
    llm_strategy = LLMExtractionStrategy(
        provider="gemini/gemini-2.0-flash-exp",
        api_token=API_KEY,
        schema=json.dumps({
            "image": "string"
        }),
        extraction_type="schema",
        instruction=f"""
        해당 뉴스 기사 페이지 ({page_url})에서 뉴스 기사와 관련된 이미지 URL을 한 장 추출해주세요.
        추출된 URL은 저장 가능한 고화질 이미지 URL이어야 하며, 한글 뉴스 기사에 적합해야 합니다.
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
        async with api_semaphore:
            result = await crawler.arun(url=page_url, config=crawl_config)
        await asyncio.sleep(API_DELAY)

        if not result.success:
            logger.error(f"이미지 추출 실패: {result.error_message}")
            return None

        return result.extracted_content.strip() if result.extracted_content else None

@retry_on_failure(retries=3, delay=2)
async def download_image(image_url, site_name="default"):
    """
    이미지 URL로부터 이미지를 다운로드한 후, 로컬 저장소에 저장하고 경로를 반환합니다.
    """
    if image_url in image_cache:
        logger.debug(f"캐시된 이미지 사용: {image_url}")
        return image_cache[image_url]

    try:
        logger.debug(f"이미지 다운로드 시작: {image_url}")
        async with api_semaphore:
            headers = get_random_headers()
            response = await asyncio.to_thread(
                requests.get, image_url, headers=headers, stream=True, timeout=5
            )
        await asyncio.sleep(API_DELAY)
        if response.status_code == 200:
            img = Image.open(BytesIO(response.content))
            img = img.convert("RGB")
            file_ext = os.path.splitext(image_url.split("?")[0])[1] or ".jpg"
            file_name = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(MEDIA_ROOT, site_name, file_name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            img.save(file_path, quality=95)
            local_path = f"/media/news_images/{site_name}/{file_name}"
            image_cache[image_url] = local_path
            logger.debug(f"이미지 다운로드 완료: {file_path}")
            return local_path
        else:
            logger.error(f"이미지 다운로드 실패: {response.status_code}")
    except requests.RequestException as e:
        logger.error(f"이미지 다운로드 오류: {e}")
    return None

# 뉴스 크롤링 함수
@retry_on_failure(retries=3, delay=2)
async def fetch_news(page_url):
    """
    주어진 뉴스 사이트 페이지에서 뉴스 기사 제목, 내용, URL, 금융 투자자산 태그를 추출하고 이미지를 다운로드합니다.
    """
    site_name = urlparse(page_url).netloc
    llm_strategy = LLMExtractionStrategy(
        provider="gemini/gemini-2.0-flash-exp",
        api_token=API_KEY,
        schema=json.dumps({
            "title": "string",
            "content": "string",
            "url": "string",
            "asset": "string"
        }),
        extraction_type="schema",
        instruction=f"""
        다음 뉴스 기사 페이지에서 정보를 추출해주세요. 반드시 결과는 한글로 제공되어야 합니다.
        1. 제목 (title): 매력적이고 한글로 작성된 뉴스 기사 제목.
        2. 내용 (content): 한글로 매력적이며 핵심 내용을 요약한 본문.
        3. URL (url): 뉴스 기사의 원본 URL.
        4. 자산 (asset): 기사에서 다루는 금융 투자자산을 한글로 기재.
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
        async with api_semaphore:
            result = await crawler.arun(url=page_url, config=crawl_config)
        await asyncio.sleep(API_DELAY)

        if not result.success:
            logger.error(f"크롤링 실패({page_url}): {result.error_message}")
            return None

        try:
            extracted_content = json.loads(result.extracted_content)
            articles = []
            for item in extracted_content:
                title = item.get("title")
                content = item.get("content")
                url = item.get("url")
                asset = item.get("asset")
                if url == page_url:
                    logger.debug(f"크롤링 대상 페이지 URL 제외: {url}")
                    continue
                if not url or not is_valid_url(url):
                    logger.error(f"유효하지 않은 URL: {url}")
                    continue

                # 이미지 추출 (두 번째 크롤링)
                image_extracted = await extract_image_from_page(url)
                local_image_path = None
                if image_extracted:
                    image_url = None
                    try:
                        parsed = json.loads(image_extracted)
                        if isinstance(parsed, list):
                            image_url = parsed[0].get("image") if parsed and isinstance(parsed[0], dict) else None
                        elif isinstance(parsed, dict):
                            image_url = parsed.get("image")
                    except (json.JSONDecodeError, TypeError) as e:
                        logger.error(f"이미지 URL 파싱 오류: {e}")

                    if image_url and (image_url.startswith("http") or image_url.startswith("https")):
                        local_image_path = await download_image(image_url, site_name)
                    else:
                        logger.error(f"유효하지 않은 이미지 URL: {image_url}")

                articles.append({
                    "title": title,
                    "content": content,
                    "url": url,
                    "asset": asset,
                    "image": local_image_path,
                })
            return articles
        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"크롤링 결과 JSON 파싱 오류: {e}")
            return None

# 자동으로 선정된 뉴스 사이트에서 뉴스 크롤링
async def fetch_all_news():
    selected_sources = await auto_select_sources()
    logger.info(f"선정된 사이트: {selected_sources}")
    articles = []
    for url in selected_sources:
        try:
            result = await fetch_news(url)
            if result:
                articles.extend(result)
        except Exception as e:
            logger.error(f"사이트 크롤링 중 예외 발생 ({url}): {e}")
    return articles

# 메인 실행 예시 (Django management command 또는 별도 스크립트에서 실행)
if __name__ == "__main__":
    import django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "your_project.settings")
    django.setup()

    async def main():
        articles = await fetch_all_news()
        if articles:
            logger.info(f"총 기사 수: {len(articles)}")
            print(json.dumps(articles, ensure_ascii=False, indent=2))
        else:
            logger.warning("크롤링된 기사가 없습니다.")

    asyncio.run(main())
