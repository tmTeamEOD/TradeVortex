from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils.dateparse import parse_date
from .models import Asset, OHLCV
from .serializers import AssetSerializer, OHLCVSerializer
import datetime
from .tasks import fetch_assets, fetch_ohlcv_data  # Celery 작업 불러오기

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer

    @action(detail=False, methods=['POST'])
    def refresh_assets(self, request):
        """
        FinanceDataReader에서 모든 자산을 자동으로 불러와 저장하는 엔드포인트
        """
        fetch_assets.delay()  # 비동기 실행
        return Response({"message": "자산 정보 자동 업데이트를 시작했습니다."})

    @action(detail=False, methods=['GET'])
    def get_symbols(self, request):
        """
        자산 타입별로 심볼과 회사명을 반환하는 액션
        """
        asset_types = Asset.ASSET_TYPE_CHOICES
        symbol_groups = {}

        # 자산 타입별로 심볼과 회사명(이름)을 함께 반환
        for asset_type, _ in asset_types:
            assets = Asset.objects.filter(asset_type=asset_type)
            symbol_groups[asset_type] = [
                {"symbol": asset.symbol, "name": asset.name} for asset in assets
            ]

        return Response(symbol_groups)

class OHLCVViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OHLCV.objects.all()
    serializer_class = OHLCVSerializer

    @action(detail=False, methods=['POST'])
    def update_ohlcv(self, request):
        """
        모든 자산의 OHLCV 데이터를 자동 업데이트하는 엔드포인트
        """
        fetch_ohlcv_data.delay()  # 비동기 실행
        return Response({"message": "OHLCV 데이터 업데이트를 시작했습니다."})

    @action(detail=False, methods=['GET'])
    def history(self, request):
        """
        특정 자산의 OHLCV 데이터 조회 (기간별)
        """
        symbol = request.query_params.get('symbol')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date', datetime.date.today().isoformat())

        if not symbol:
            return Response({'error': 'symbol 파라미터가 필요합니다.'}, status=400)

        try:
            asset = Asset.objects.get(symbol=symbol)
        except Asset.DoesNotExist:
            return Response({'error': '해당 symbol을 찾을 수 없습니다.'}, status=404)

        ohlcv_data = OHLCV.objects.filter(
            asset=asset,
            date__range=[parse_date(start_date), parse_date(end_date)]
        ).order_by('-date')

        serializer = OHLCVSerializer(ohlcv_data, many=True)
        return Response(serializer.data)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .forecast import predict_forecast


class ForecastAPIView(APIView):
    """
    GET 요청을 받아 DB에 저장된 OHLCV 데이터를 이용하여
    특정 자산의 향후 7일 종가 예측 결과를 반환합니다.
    요청 예시: /forecast/?symbol=AAPL
    """

    def get(self, request, format=None):
        asset_symbol = request.query_params.get('symbol')
        if not asset_symbol:
            return Response({"error": "symbol 파라미터가 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            forecast = predict_forecast(asset_symbol)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)  # 예외 처리에서 404를 더 적합하게 사용
        except Exception as e:
            return Response({"error": f"예측 처리 중 오류 발생: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 예측 결과가 리스트 형태로 반환된다고 가정하고 결과 반환
        return Response({
            "asset": asset_symbol,
            "forecast": forecast["forecast"]  # forecast 필드를 반환 (forecast는 predict_forecast가 반환하는 dict로 가정)
        })
