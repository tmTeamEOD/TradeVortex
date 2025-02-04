# analysis.py
import numpy as np
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import logging

logger = logging.getLogger(__name__)

# 감정 분석 예시 (실제 서비스에서는 한국어 전용 모델 사용 권장)
try:
    from transformers import pipeline
    sentiment_pipeline = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
except ImportError:
    sentiment_pipeline = None
    logger.warning("Transformers 모듈이 설치되지 않았습니다. 감정 분석이 제대로 동작하지 않을 수 있습니다.")

def analyze_sentiment(text):
    """
    주어진 텍스트에 대해 감정 분석을 수행합니다.
    결과는 "긍정", "중립", "부정" 중 하나로 반환됩니다.
    (예시에서는 transformers pipeline의 결과를 간단하게 매핑)
    """
    if not sentiment_pipeline:
        return "중립"
    try:
        result = sentiment_pipeline(text[:512])[0]  # 긴 텍스트는 잘라서 처리
        label = result.get("label", "")
        # nlptown 모델은 "1 star", "2 star", ... 형식의 레이블을 반환함
        # 간단히 3 이하: 부정, 4: 중립, 5: 긍정으로 매핑 (예시)
        if "star" in label:
            score = int(label.split()[0])
            if score <= 3:
                return "부정"
            elif score == 4:
                return "중립"
            else:
                return "긍정"
        else:
            return label
    except Exception as e:
        logger.error(f"감정 분석 오류: {e}")
        return "중립"

def compute_word_frequencies(text_list, min_length=2):
    """
    여러 텍스트 리스트에 대해 단어 빈도수를 계산합니다.
    간단히 알파벳/한글만 추출하여 소문자 처리 후 빈도수 계산 (실제 서비스에서는 형태소 분석 권장)
    """
    words = []
    for text in text_list:
        # 한글 및 영문 단어 추출
        found = re.findall(r'[가-힣]+|[A-Za-z]+', text)
        words.extend([w.lower() for w in found if len(w) >= min_length])
    return dict(Counter(words))

def remove_duplicates(news_items, threshold=0.8):
    """
    뉴스 기사 리스트(news_items: list of dict 혹은 queryset)를 대상으로 TF-IDF와 코사인 유사도로 중복 여부를 판단합니다.
    threshold 이상의 유사도를 보이면 중복으로 간주합니다.
    반환: 중복이 아닌 뉴스 항목 리스트 (중복된 경우 is_duplicate 필드를 True로 설정)
    """
    contents = [item["content"] for item in news_items]
    if len(contents) == 0:
        return news_items

    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(contents)
    similarity_matrix = cosine_similarity(tfidf_matrix)

    n = len(news_items)
    duplicates = [False] * n

    # 간단한 중복 제거: 한 기사와 비교해 유사도가 threshold 이상이면 후속 기사는 중복 처리
    for i in range(n):
        if duplicates[i]:
            continue
        for j in range(i + 1, n):
            if similarity_matrix[i, j] > threshold:
                duplicates[j] = True

    # news_items에 중복 여부 반영
    for idx, item in enumerate(news_items):
        item["is_duplicate"] = duplicates[idx]
    return news_items
