from __future__ import annotations

import io
from PIL import Image as PILImage
from django.core.files.base import ContentFile


def generate_thumbnail(
    source_path: str,
    max_width: int = 400,
    max_height: int = 565,
    quality: int = 85,
) -> ContentFile:
    """
    Ouvre une image source, la redimensionne en conservant le ratio,
    et retourne un ContentFile JPEG prêt à être sauvegardé dans un ImageField.
    """
    with PILImage.open(source_path) as img:
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')
        elif img.mode == 'RGBA':
            background = PILImage.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background

        img.thumbnail((max_width, max_height), PILImage.LANCZOS)

        buffer = io.BytesIO()
        img.save(buffer, format='JPEG', quality=quality, optimize=True)
        buffer.seek(0)
        return ContentFile(buffer.read())


def get_image_dimensions(file_obj: object) -> tuple[int | None, int | None]:
    """
    Retourne (width, height) d'un fichier image uploadé.
    Remet le pointeur au début après lecture.
    """
    try:
        img = PILImage.open(file_obj)  # type: ignore[arg-type]
        width, height = img.size
        file_obj.seek(0)  # type: ignore[attr-defined]
        return width, height
    except Exception:
        return None, None
