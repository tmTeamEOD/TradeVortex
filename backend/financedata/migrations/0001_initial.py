# Generated by Django 5.1.4 on 2025-02-04 08:36

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Asset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('symbol', models.CharField(max_length=50, unique=True)),
                ('asset_type', models.CharField(choices=[('stock_kr', '국내 주식'), ('stock_us', '해외 주식'), ('crypto', '암호화폐'), ('forex', '환율')], max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='OHLCV',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('open', models.DecimalField(decimal_places=2, max_digits=15)),
                ('high', models.DecimalField(decimal_places=2, max_digits=15)),
                ('low', models.DecimalField(decimal_places=2, max_digits=15)),
                ('close', models.DecimalField(decimal_places=2, max_digits=15)),
                ('volume', models.BigIntegerField()),
                ('asset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ohlcv', to='financedata.asset')),
            ],
            options={
                'unique_together': {('asset', 'date')},
            },
        ),
    ]
