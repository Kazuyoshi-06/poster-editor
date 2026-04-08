from __future__ import annotations

from rest_framework import serializers
from .models import UploadedAsset

ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


class UploadedAssetSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file = serializers.ImageField(write_only=True)

    class Meta:
        model = UploadedAsset
        fields = [
            'id', 'file', 'file_url', 'original_name', 'asset_type',
            'width', 'height', 'file_size', 'uploaded_at',
        ]
        read_only_fields = ['original_name', 'width', 'height', 'file_size', 'uploaded_at']

    def get_file_url(self, obj: UploadedAsset) -> str:
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def validate_file(self, value: object) -> object:
        if hasattr(value, 'size') and value.size > MAX_FILE_SIZE:  # type: ignore[union-attr]
            raise serializers.ValidationError(
                f"Le fichier est trop volumineux (max {MAX_FILE_SIZE // (1024 * 1024)} MB)."
            )
        return value
