# admin.py
from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'created_at', 'updated_at')
    search_fields = ('user__username', 'name')
    ordering = ('-created_at',)
