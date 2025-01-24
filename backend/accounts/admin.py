from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('추가 정보', {
            'fields': (
                'profile_picture', 'bio', 'joined_at', 'last_activity',
                'phone_number', 'is_verified', 'followers', 'points', 'level',
            ),
        }),
    )

    list_display = ('email', 'username', 'points', 'level', 'is_verified', 'last_activity')

admin.site.register(CustomUser, CustomUserAdmin)
