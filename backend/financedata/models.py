from django.db import models


# 투자 자산 모델 (국내 주식, 해외 주식, 암호화폐, 환율 등)
class Asset(models.Model):
    ASSET_TYPE_CHOICES = [
        ('stock_kr', '국내 주식'),
        ('stock_us', '해외 주식'),
        ('crypto', '암호화폐'),
        ('forex', '환율'),
    ]

    name = models.CharField(max_length=255)  # 종목 이름
    symbol = models.CharField(max_length=50, unique=True)  # 심볼 (예: 005930, AAPL, BTC/USD)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES)  # 자산 종류
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.symbol})"


# OHLCV 데이터 모델
class OHLCV(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name="ohlcv")
    date = models.DateField()  # 날짜
    open = models.DecimalField(max_digits=15, decimal_places=2)
    high = models.DecimalField(max_digits=15, decimal_places=2)
    low = models.DecimalField(max_digits=15, decimal_places=2)
    close = models.DecimalField(max_digits=15, decimal_places=2)
    volume = models.BigIntegerField()

    class Meta:
        unique_together = ('asset', 'date')  # 동일 자산 + 날짜 중복 방지

    def __str__(self):
        return f"{self.asset.symbol} - {self.date}"
