import os
import asyncio
import json
import uuid
import requests
from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import APIView
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy

# 환경 변수에서 API 키 불러오기
API_KEY = os.getenv("GEMINI_API_KEY")

# 미디어 폴더 경로 설정
MEDIA_ROOT = os.path.join(settings.MEDIA_ROOT, "news_images")
if not os.path.exists(MEDIA_ROOT):
    os.makedirs(MEDIA_ROOT)

class NewsItem:
    def __init__(self, title: str, content: str, image: str, url: str):
        self.title = title
        self.content = content
        self.image = self.download_image(image) if image else None
        self.url = url

    def to_dict(self):
        return {
            "title": self.title,
            "content": self.content,
            "image": self.image,
            "url": self.url,
        }

    def download_image(self, image_url):
        """이미지를 다운로드하여 로컬 저장 후 파일 경로 반환"""
        try:
            response = requests.get(image_url, stream=True, timeout=5)
            if response.status_code == 200:
                file_ext = image_url.split(".")[-1].split("?")[0]
                file_name = f"{uuid.uuid4()}.{file_ext}"
                file_path = os.path.join(MEDIA_ROOT, file_name)

                with open(file_path, "wb") as img_file:
                    for chunk in response.iter_content(1024):
                        img_file.write(chunk)

                return f"/media/news_images/{file_name}"
        except Exception as e:
            print(f"이미지 다운로드 오류: {e}")
        return None

class CrawlNewsView(APIView):
    def get(self, request):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(self.fetch_news())
        return JsonResponse({"news": result}, safe=False)

    async def fetch_news(self):
        llm_strategy = LLMExtractionStrategy(
            provider="gemini/gemini-1.5-flash",
            api_token=API_KEY,
            schema=json.dumps({
                "title": "string",
                "content": "string",
                "image": "string",
                "url": "string"
            }),
            extraction_type="schema",
            instruction="뉴스 페이지에서 제목, 내용, 이미지 및 원본 링크를 추출하세요.",
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
            result = await crawler.arun(
                url="https://news.naver.com/section/101/",  # 예제 뉴스 페이지
                config=crawl_config
            )

            if result.success:
                try:
                    if result.extracted_content:
                        data = json.loads(result.extracted_content)
                        if isinstance(data, list):
                            news_items = [
                                NewsItem(
                                    title=item.get("title", "No Title"),
                                    content=item.get("content", "No Content"),
                                    image=item.get("image"),
                                    url=item.get("url", "No URL")
                                ).to_dict() for item in data
                            ]
                        else:
                            news_items = [NewsItem(
                                title=data.get("title", "No Title"),
                                content=data.get("content", "No Content"),
                                image=data.get("image"),
                                url=data.get("url", "No URL")
                            ).to_dict()]

                        return news_items
                    else:
                        return [{"error": "Extracted content was empty."}]
                except json.JSONDecodeError:
                    return [{"error": "Invalid JSON format."}]
            else:
                return [{"error": result.error_message}]
