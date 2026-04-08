from django.db import models


class UploadedAsset(models.Model):
    ASSET_TYPE_CHOICES = [
        ('image', 'Image'),
        ('background', 'Fond'),
        ('logo', 'Logo'),
    ]
    file = models.ImageField(upload_to='uploads/%Y/%m/')
    original_name = models.CharField(max_length=255)
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE_CHOICES, default='image')
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    file_size = models.IntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.original_name
