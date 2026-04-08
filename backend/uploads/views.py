from __future__ import annotations

from rest_framework import viewsets, status
from rest_framework.response import Response
from PIL import Image as PILImage

from .models import UploadedAsset
from .serializers import UploadedAssetSerializer


class UploadedAssetViewSet(viewsets.ModelViewSet):
    serializer_class = UploadedAssetSerializer

    def get_queryset(self):  # type: ignore[override]
        qs = UploadedAsset.objects.all().order_by('-uploaded_at')
        asset_type = self.request.query_params.get('asset_type')
        if asset_type:
            qs = qs.filter(asset_type=asset_type)
        return qs

    def perform_create(self, serializer: UploadedAssetSerializer) -> None:
        uploaded_file = self.request.FILES.get('file')
        width: int | None = None
        height: int | None = None
        file_size: int | None = None

        if uploaded_file:
            file_size = uploaded_file.size
            try:
                img = PILImage.open(uploaded_file)
                width, height = img.size
                uploaded_file.seek(0)
            except Exception:
                pass

        serializer.save(
            original_name=uploaded_file.name if uploaded_file else '',
            width=width,
            height=height,
            file_size=file_size,
        )

    def destroy(self, request, *args, **kwargs) -> Response:  # type: ignore[override]
        instance = self.get_object()
        # Supprime le fichier physique du disque
        try:
            if instance.file:
                instance.file.delete(save=False)
        except Exception:
            pass
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
