# Generated by Django 5.1.4 on 2025-01-03 12:15

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('board', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BoardType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True, verbose_name='게시판 이름')),
                ('description', models.TextField(blank=True, null=True, verbose_name='게시판 설명')),
            ],
            options={
                'verbose_name': '게시판 유형',
                'verbose_name_plural': '게시판 유형들',
            },
        ),
        migrations.AlterModelOptions(
            name='post',
            options={'verbose_name': '게시물', 'verbose_name_plural': '게시물들'},
        ),
        migrations.AddField(
            model_name='post',
            name='like_count',
            field=models.PositiveIntegerField(default=0, verbose_name='좋아요 수'),
        ),
        migrations.AddField(
            model_name='post',
            name='view_count',
            field=models.PositiveIntegerField(default=0, verbose_name='조회수'),
        ),
        migrations.AlterField(
            model_name='post',
            name='author',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='posts', to=settings.AUTH_USER_MODEL, verbose_name='작성자'),
        ),
        migrations.AlterField(
            model_name='post',
            name='content',
            field=models.TextField(verbose_name='내용'),
        ),
        migrations.AlterField(
            model_name='post',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, verbose_name='생성일'),
        ),
        migrations.AlterField(
            model_name='post',
            name='title',
            field=models.CharField(max_length=255, verbose_name='제목'),
        ),
        migrations.AlterField(
            model_name='post',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, verbose_name='수정일'),
        ),
        migrations.AddField(
            model_name='post',
            name='board_type',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, related_name='posts', to='board.boardtype', verbose_name='게시판 유형'),
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(verbose_name='댓글 내용')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='작성일')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='수정일')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to=settings.AUTH_USER_MODEL, verbose_name='작성자')),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='board.post', verbose_name='게시물')),
            ],
            options={
                'verbose_name': '댓글',
                'verbose_name_plural': '댓글들',
            },
        ),
        migrations.CreateModel(
            name='Image',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='post_images/%Y/%m/%d/', verbose_name='이미지')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True, verbose_name='업로드 날짜')),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='board.post', verbose_name='게시물')),
            ],
            options={
                'verbose_name': '게시물 이미지',
                'verbose_name_plural': '게시물 이미지들',
            },
        ),
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reason', models.CharField(choices=[('spam', '스팸'), ('abuse', '악성 내용'), ('other', '기타')], max_length=50, verbose_name='신고 사유')),
                ('details', models.TextField(blank=True, null=True, verbose_name='추가 설명')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='신고일')),
                ('comment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='board.comment', verbose_name='신고 대상 댓글')),
                ('post', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='board.post', verbose_name='신고 대상 게시물')),
                ('reporter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='신고자')),
            ],
            options={
                'verbose_name': '신고',
                'verbose_name_plural': '신고들',
            },
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True, verbose_name='태그 이름')),
                ('posts', models.ManyToManyField(related_name='tags', to='board.post', verbose_name='게시물')),
            ],
            options={
                'verbose_name': '태그',
                'verbose_name_plural': '태그들',
            },
        ),
    ]
