from django.contrib import admin
from .models import UploadedAsset


@admin.register(UploadedAsset)
class UploadedAssetAdmin(admin.ModelAdmin):
    list_display = ['id', 'original_name', 'asset_type', 'width', 'height', 'file_size', 'uploaded_at']
    list_display_links = ['id', 'original_name']
    list_filter = ['asset_type']
    search_fields = ['original_name']
    readonly_fields = ['uploaded_at']
    ordering = ['-uploaded_at']
