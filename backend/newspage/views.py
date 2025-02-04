# views.py
import datetime
import logging

from celery import current_app
from django.db.models import Count
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import NewsItem
from .pagination import NewsItemPagination
from .serializers import NewsItemSerializer
from .analysis import compute_word_frequencies
from .tasks import crawl_news_task

logger = logging.getLogger(__name__)


class CrawlControlView(APIView):
    """
    뉴스 크롤링 작업을 제어하는 API입니다.
    클라이언트는 action 값('start' 또는 'stop')을 전송하여 작업을 시작하거나 중지할 수 있습니다.
    """

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super(CrawlControlView, self).dispatch(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        logger.info("요청 데이터: %s", request.data)
        action = request.data.get("action", "").lower()
        if action == "start":
            task = crawl_news_task.delay()
            return Response({"status": "started", "task_id": task.id})
        elif action == "stop":
            task_id = request.data.get("task_id")
            if not task_id:
                return Response({"error": "중지하려면 task_id가 필요합니다."}, status=400)
            current_app.control.revoke(task_id, terminate=True, signal='SIGTERM')
            return Response({"status": "stopped", "task_id": task_id})
        else:
            return Response(
                {"error": "유효하지 않은 액션입니다. action은 'start' 또는 'stop'이어야 합니다."},
                status=400
            )


class NewsListView(generics.ListAPIView):
    """
    DB에 저장된 뉴스 기사 리스트를 페이징, 필터, 정렬, 검색 기능과 함께 JSON으로 반환합니다.
    """
    queryset = NewsItem.objects.all().order_by("-created_at")
    serializer_class = NewsItemSerializer
    pagination_class = NewsItemPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['asset', 'sentiment', 'is_duplicate']
    ordering_fields = ['created_at']
    search_fields = ['title', 'content']


class NewsStatsView(APIView):
    """
    뉴스 기사의 감정 분포, 일자별 기사 수 등의 통계 데이터를 반환합니다.
    """
    def get(self, request):
        # 감정 분포 통계
        sentiment_stats = NewsItem.objects.values('sentiment').annotate(count=Count('id'))

        # 최근 7일 간 일자별 기사 수 통계
        today = datetime.date.today()
        date_stats = []
        for i in range(7):
            day = today - datetime.timedelta(days=i)
            count = NewsItem.objects.filter(created_at__date=day).count()
            date_stats.append({"date": day.strftime("%Y-%m-%d"), "count": count})

        return Response({
            "sentiment_stats": list(sentiment_stats),
            "date_stats": date_stats,
        })


from rest_framework.response import Response
from rest_framework.views import APIView
from collections import Counter
from .models import NewsItem
import re

from rest_framework.response import Response
from rest_framework.views import APIView
from collections import Counter
from .models import NewsItem
import re

from rest_framework.response import Response
from rest_framework.views import APIView
from collections import Counter
from .models import NewsItem
from konlpy.tag import Okt  # KoNLPy의 Okt 토크나이저 임포트

class WordCloudDataView(APIView):
    """
    뉴스 기사 전체 본문을 대상으로 단어 빈도수를 계산하여
    {"word_frequencies": [ ["단어", 빈도], ... ]} 형태로 반환합니다.
    """

    def get(self, request):
        # 모든 뉴스 본문 텍스트를 가져옴
        texts = list(NewsItem.objects.values_list("content", flat=True))
        if not texts:
            return Response({"word_frequencies": []}, status=200)  # 빈 데이터 처리

        okt = Okt()  # 형태소 분석기 객체 생성
        words = []
        for text in texts:
            # Okt의 nouns() 메서드는 명사만 추출합니다.
            # 필요에 따라 다른 메서드(ex. morphs(), pos() 등)를 활용할 수 있습니다.
            nouns = okt.nouns(text)
            # 1글자짜리 명사는 의미가 부족할 수 있으므로, 길이가 2 이상인 단어만 사용합니다.
            words.extend([noun for noun in nouns if len(noun) > 1])

        # 불용어 (Stopwords) 리스트 - 필요 시 추가 가능
        stopwords = set(["그", "저", "것", "수", "등"])  # 예시 stopwords (추가/수정 가능)
        words = [word for word in words if word not in stopwords]

        # 단어 빈도수 계산
        word_freq = Counter(words)

        # 상위 100개 단어 추출
        top_words = word_freq.most_common(100)

        # 응답 형식 변경: {"word_frequencies": [["단어", 빈도], ...]}
        word_frequencies = [[word, count] for word, count in top_words]

        return Response({"word_frequencies": word_frequencies}, status=200)

class NewsDetailAPIView(generics.RetrieveAPIView):
    queryset = NewsItem.objects.all()
    serializer_class = NewsItemSerializer
