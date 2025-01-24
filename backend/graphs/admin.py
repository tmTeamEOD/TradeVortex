from django.contrib import admin
from .models import FinancialData

@admin.register(FinancialData)
class FinancialDataAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'asset_type', 'timestamp', 'close', 'volume')
    list_filter = ('asset_type', 'timestamp')
