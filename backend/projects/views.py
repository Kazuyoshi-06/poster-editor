from __future__ import annotations

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.request import Request
from django.core.files.base import ContentFile
import base64

from .models import PosterProject, Template
from .serializers import PosterProjectSerializer, TemplateSerializer


class PosterProjectViewSet(viewsets.ModelViewSet):
    queryset = PosterProject.objects.all()
    serializer_class = PosterProjectSerializer

    def get_serializer_context(self) -> dict:
        context = super().get_serializer_context()
        return context

    @action(detail=True, methods=['post'], url_path='thumbnail')
    def update_thumbnail(self, request: Request, pk: str | None = None) -> Response:
        """
        Reçoit une image en base64 (data URI) et la sauvegarde comme thumbnail du projet.
        Payload attendu : { "image": "data:image/jpeg;base64,..." }
        """
        project = self.get_object()
        image_data: str = request.data.get('image', '')

        if not image_data:
            return Response(
                {'error': 'Le champ "image" est requis.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ';base64,' not in image_data:
            return Response(
                {'error': 'Format invalide. Attendu : data:<mime>;base64,<data>'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            format_part, imgstr = image_data.split(';base64,', 1)
            ext = format_part.split('/')[-1].split('+')[0]  # ex: "jpeg" depuis "image/jpeg"
            if ext not in ('jpeg', 'jpg', 'png', 'webp'):
                ext = 'jpg'
            decoded = base64.b64decode(imgstr)
            data = ContentFile(decoded, name=f'thumb_{pk}.{ext}')
            project.thumbnail = data
            project.save(update_fields=['thumbnail'])
            serializer = self.get_serializer(project)
            return Response(serializer.data)
        except Exception as exc:
            return Response(
                {'error': f'Impossible de traiter l\'image : {exc}'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class TemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TemplateSerializer
    http_method_names = ['get', 'head', 'options']

    def get_queryset(self):  # type: ignore[override]
        qs = Template.objects.all().order_by('name')
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs
