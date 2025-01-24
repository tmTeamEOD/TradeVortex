from django.contrib import admin
from .models import BoardType, Post, Image, Comment, Tag, Report

admin.site.register(BoardType)
admin.site.register(Post)
admin.site.register(Image)
admin.site.register(Comment)
admin.site.register(Tag)
admin.site.register(Report)