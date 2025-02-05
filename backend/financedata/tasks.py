import FinanceDataReader as fdr
import datetime
import logging
from celery import shared_task
from .models import Asset, OHLCV

# 로깅 설정
logger = logging.getLogger(__name__)

@shared_task
def fetch_assets():
    """
    FinanceDataReader에서 제공하는 모든 자산을 자동으로 DB에 추가하는 Celery Task
    """
    logger.info("🔍 [START] 자동 자산 등록 시작")

    asset_list = []

    try:
        # 한국 주식 종목 가져오기
        logger.info("📡 한국 주식 데이터 가져오는 중...")
        stock_kr = fdr.StockListing("KRX")
        for _, row in stock_kr.iterrows():
            asset_list.append(("stock_kr", row['Name'], row['Code']))
        logger.info(f"✅ 한국 주식 {len(stock_kr)}개 수집 완료")

        # 미국 주식 종목 가져오기
        logger.info("📡 미국 주식 데이터 가져오는 중...")
        stock_us = fdr.StockListing("NASDAQ")
        for _, row in stock_us.iterrows():
            asset_list.append(("stock_us", row['Name'], row['Symbol']))
        logger.info(f"✅ 미국 주식 {len(stock_us)}개 수집 완료")

        # 암호화폐 데이터 추가
        crypto_assets = [("crypto", "Bitcoin", "BTC/USD"), ("crypto", "Ethereum", "ETH/USD")]
        asset_list.extend(crypto_assets)
        logger.info("✅ 암호화폐 데이터 추가 완료")

        # 환율 정보 추가
        forex_assets = [("forex", "USD/KRW", "USD/KRW"), ("forex", "EUR/KRW", "EUR/KRW")]
        asset_list.extend(forex_assets)
        logger.info("✅ 환율 데이터 추가 완료")

        # DB에 저장
        for asset_type, name, symbol in asset_list:
            obj, created = Asset.objects.get_or_create(
                asset_type=asset_type,
                name=name,
                symbol=symbol
            )
            if created:
                logger.info(f"✅ [NEW] {name} ({symbol}) 저장 완료")
            else:
                logger.info(f"🟡 [EXIST] {name} ({symbol}) 이미 존재")

        logger.info(f"🔍 [COMPLETE] 총 {len(asset_list)}개의 자산 등록 완료")
        return f"Total {len(asset_list)} assets added."

    except Exception as e:
        logger.error(f"❌ [ERROR] 자산 등록 실패: {e}")
        return f"Failed to fetch assets: {str(e)}"


@shared_task
def fetch_ohlcv_data():
    """
    모든 자산의 OHLCV 데이터를 FDR에서 가져와 업데이트하는 Celery Task
    """
    logger.info("🔍 [START] OHLCV 데이터 업데이트 시작")
    assets = Asset.objects.all()
    start_date = (datetime.datetime.today() - datetime.timedelta(days=365)).strftime('%Y-%m-%d')

    total_count = 0

    for asset in assets:
        try:
            logger.info(f"📡 {asset.symbol} ({asset.name}) 데이터 가져오는 중...")
            df = fdr.DataReader(asset.symbol, start=start_date)

            for index, row in df.iterrows():
                date = index.date()
                _, created = OHLCV.objects.update_or_create(
                    asset=asset, date=date,
                    defaults={
                        "open": row['Open'],
                        "high": row['High'],
                        "low": row['Low'],
                        "close": row['Close'],
                        "volume": row['Volume'],
                    }
                )
                if created:
                    total_count += 1
            logger.info(f"✅ {asset.symbol} 데이터 업데이트 완료 ({len(df)}건)")

        except Exception as e:
            logger.error(f"❌ [ERROR] {asset.symbol} ({asset.name}) 데이터 수집 실패: {e}")

    logger.info(f"🔍 [COMPLETE] 총 {total_count}개의 OHLCV 데이터 업데이트 완료")
    return f"OHLCV Data Updated. Total {total_count} entries."
