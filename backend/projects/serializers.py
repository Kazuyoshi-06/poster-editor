from __future__ import annotations

from rest_framework import serializers
from .models import PosterProject, Template


class PosterProjectSerializer(serializers.ModelSerializer):
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = PosterProject
        fields = [
            'id', 'name', 'canvas_data', 'width', 'height',
            'thumbnail', 'thumbnail_url', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'thumbnail': {'write_only': True, 'required': False},
        }

    def get_thumbnail_url(self, obj: PosterProject) -> str | None:
        if not obj.thumbnail:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return obj.thumbnail.url

    def validate_name(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Le nom du projet ne peut pas être vide.")
        return value.strip()

    def validate_canvas_data(self, value: dict) -> dict:
        if not isinstance(value, dict):
            raise serializers.ValidationError("canvas_data doit être un objet JSON.")
        return value


class TemplateSerializer(serializers.ModelSerializer):
    preview_url = serializers.SerializerMethodField()

    class Meta:
        model = Template
        fields = ['id', 'name', 'category', 'canvas_data', 'preview', 'preview_url', 'created_at']
        read_only_fields = ['created_at']
        extra_kwargs = {
            'preview': {'write_only': True, 'required': False},
        }

    def get_preview_url(self, obj: Template) -> str | None:
        if not obj.preview:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.preview.url)
        return obj.preview.url
