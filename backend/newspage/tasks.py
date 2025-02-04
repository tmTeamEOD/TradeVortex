# tasks.py
import asyncio
from celery import shared_task
from django.db import IntegrityError
from .models import NewsItem
from .crawler import fetch_all_news
from .analysis import analyze_sentiment, remove_duplicates
import logging

logger = logging.getLogger(__name__)

@shared_task
def crawl_news_task():
    """
    Celery 태스크를 이용하여 비동기 크롤링을 실행한 후,
    감정 분석을 진행하고, 중복 여부를 판단하여 DB에 저장합니다.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    news_list = loop.run_until_complete(fetch_all_news())
    if not news_list:
        logger.info("크롤링 결과 없음")
        return "No articles inserted."

    # 감정 분석 적용 (각 기사의 content 기준)
    for article in news_list:
        article["sentiment"] = analyze_sentiment(article.get("content", ""))

    # 중복 제거 실행 (실제 저장 전에 처리)
    news_list = remove_duplicates(news_list, threshold=0.8)

    inserted_count = 0
    for article in news_list:
        # 중복이면 is_duplicate=True; 중복 기사는 저장은 하되 프론트에서 필터링할 수 있음.
        try:
            obj, created = NewsItem.objects.get_or_create(
                url=article["url"],
                defaults={
                    "title": article["title"],
                    "content": article["content"],
                    "asset": article.get("asset"),
                    "image": article.get("image"),
                    "sentiment": article.get("sentiment"),
                    "is_duplicate": article.get("is_duplicate", False),
                }
            )
            if created:
                inserted_count += 1
        except IntegrityError as e:
            logger.error(f"DB 저장 오류: {e}")
    logger.info(f"크롤링 완료: {inserted_count}개 기사 삽입됨.")
    return f"Inserted {inserted_count} articles"
