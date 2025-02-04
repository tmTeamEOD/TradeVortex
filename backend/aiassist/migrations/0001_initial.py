# Generated by Django 5.1.4 on 2025-02-01 19:21

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CrewAIRun',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('inputs', models.JSONField()),
                ('result', models.JSONField()),
                ('status', models.CharField(default='pending', max_length=50)),
                ('recommendations', models.PositiveIntegerField(default=0)),
                ('user', models.ForeignKey(default=10000, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
