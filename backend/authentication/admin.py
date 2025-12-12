from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Champs à afficher dans l'admin
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password', 'profile_photo')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'profile_photo'),
        }),
    )
    list_display = ('username', 'email', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
    ordering = ('username',)
