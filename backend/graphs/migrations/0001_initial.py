# Generated by Django 5.1.4 on 2025-01-06 17:17

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='FinancialData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('symbol', models.CharField(max_length=20)),
                ('open', models.DecimalField(decimal_places=2, max_digits=20)),
                ('high', models.DecimalField(decimal_places=2, max_digits=20)),
                ('low', models.DecimalField(decimal_places=2, max_digits=20)),
                ('close', models.DecimalField(decimal_places=2, max_digits=20)),
                ('volume', models.DecimalField(blank=True, decimal_places=2, max_digits=20, null=True)),
                ('timestamp', models.DateTimeField()),
                ('asset_type', models.CharField(choices=[('STOCK', 'Stock'), ('OPTION', 'Option'), ('INDEX', 'Index'), ('FOREX', 'Forex'), ('CRYPTO', 'Portfolio')], max_length=10)),
                ('expiration_date', models.DateField(blank=True, null=True)),
                ('strike_price', models.DecimalField(blank=True, decimal_places=2, max_digits=20, null=True)),
                ('option_type', models.CharField(blank=True, choices=[('C', 'Call'), ('P', 'Put')], max_length=1, null=True)),
            ],
            options={
                'indexes': [models.Index(fields=['symbol', 'timestamp'], name='graphs_fina_symbol_0aa594_idx')],
                'unique_together': {('symbol', 'timestamp')},
            },
        ),
    ]
