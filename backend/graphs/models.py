from django.db import models
from datetime import datetime

# 자산 종류 정의
class AssetType(models.TextChoices):
    STOCK = 'STOCK', 'Stock'
    OPTION = 'OPTION', 'Option'
    INDEX = 'INDEX', 'Index'
    FOREX = 'FOREX', 'Forex'
    CRYPTO = 'CRYPTO', 'Portfolio'


class FinancialData(models.Model):
    symbol = models.CharField(max_length=20)  # 종목명
    open = models.DecimalField(max_digits=20, decimal_places=2)
    high = models.DecimalField(max_digits=20, decimal_places=2)
    low = models.DecimalField(max_digits=20, decimal_places=2)
    close = models.DecimalField(max_digits=20, decimal_places=2)
    volume = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)  # 거래량
    timestamp = models.DateTimeField()  # 데이터 수집 시간
    asset_type = models.CharField(max_length=10, choices=AssetType.choices)  # 자산 유형

    # 옵션 데이터 필드
    expiration_date = models.DateField(null=True, blank=True)  # 만기일
    strike_price = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)  # 행사가격
    option_type = models.CharField(
        max_length=1, choices=[('C', 'Call'), ('P', 'Put')], null=True, blank=True
    )  # 옵션 종류

    def __str__(self):
        return f"{self.symbol} - {self.asset_type}"

    def is_option(self):
        """옵션 데이터 여부 확인"""
        return self.asset_type == AssetType.OPTION

    class Meta:
        indexes = [
            models.Index(fields=['symbol', 'timestamp']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['symbol', 'timestamp'], name='unique_symbol_timestamp'),
        ]
