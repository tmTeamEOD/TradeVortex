# Generated by Django 5.1.4 on 2025-01-03 15:40

from django.db import migrations


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('board', '0002_boardtype_alter_post_options_post_like_count_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='FreeBoardPost',
            fields=[
            ],
            options={
                'verbose_name': '자유게시판 게시물',
                'verbose_name_plural': '자유게시판 게시물들',
                'proxy': True,
                'indexes': [],
                'constraints': [],
            },
            bases=('board.post',),
        ),
    ]
