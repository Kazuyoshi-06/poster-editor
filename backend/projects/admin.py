from django.contrib import admin
from .models import PosterProject, Template


@admin.register(PosterProject)
class PosterProjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'width', 'height', 'created_at', 'updated_at']
    list_display_links = ['id', 'name']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'created_at']
    list_display_links = ['id', 'name']
    list_filter = ['category']
    search_fields = ['name']
    readonly_fields = ['created_at']
