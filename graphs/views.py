from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
import time  # 지연을 추가하기 위해 time 모듈을 임포트

# 지연 시간 (초 단위)
REQUEST_DELAY = 1  # 1초 지연

@api_view(['GET'])
def fetch_seconds_candles(request, symbol):
    """
    초 단위 캔들 데이터를 반환하는 뷰
    """
    try:
        # 요청 파라미터 가져오기
        count = request.query_params.get("count")
        unit = request.query_params.get("unit")
        to = request.query_params.get("to")

        # 필수 파라미터 검증
        if not count or not unit:
            return Response({"error": "count와 unit은 필수입니다."}, status=400)

        # 지연 추가
        time.sleep(REQUEST_DELAY)

        # Upbit API 호출
        url = "https://api.upbit.com/v1/candles/seconds"
        params = {
            "market": symbol,
            "count": count,
            "unit": unit,
            "to": to
        }
        headers = {"accept": "application/json"}

        upbit_response = requests.get(url, params=params, headers=headers, timeout=10)
        upbit_response.raise_for_status()
        data = upbit_response.json()

        return Response({"status": "success", "data": data}, status=200)

    except requests.exceptions.RequestException as e:
        return Response({"error": f"Upbit API 요청 실패: {str(e)}"}, status=500)
    except Exception as e:
        return Response({"error": f"서버 오류: {str(e)}"}, status=500)

@api_view(['GET'])
def fetch_other_candles(request, candle_type, symbol):
    """
    분봉, 일봉, 주봉, 월봉 데이터를 반환하는 뷰
    """
    try:
        # 요청 파라미터 가져오기
        count = request.query_params.get("count")
        to = request.query_params.get("to")

        # 필수 파라미터 검증
        if not count:
            return Response({"error": "count는 필수입니다."}, status=400)

        # 지연 추가
        time.sleep(REQUEST_DELAY)

        # Upbit API 호출
        url = f"https://api.upbit.com/v1/candles/{candle_type}"
        params = {
            "market": symbol,
            "count": count,
            "to": to
        }
        headers = {"accept": "application/json"}

        upbit_response = requests.get(url, params=params, headers=headers, timeout=10)
        upbit_response.raise_for_status()
        data = upbit_response.json()

        return Response({"status": "success", "data": data}, status=200)

    except requests.exceptions.RequestException as e:
        return Response({"error": f"Upbit API 요청 실패: {str(e)}"}, status=500)
    except Exception as e:
        return Response({"error": f"서버 오류: {str(e)}"}, status=500)
