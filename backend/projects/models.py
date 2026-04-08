from django.db import models


class PosterProject(models.Model):
    name = models.CharField(max_length=200)
    canvas_data = models.JSONField(default=dict)
    width = models.IntegerField(default=794)
    height = models.IntegerField(default=1123)
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return self.name


class Template(models.Model):
    CATEGORY_CHOICES = [
        ('event', 'Événement'),
        ('tournament', 'Tournoi'),
        ('announcement', 'Annonce'),
        ('generic', 'Générique'),
    ]
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='generic')
    canvas_data = models.JSONField(default=dict)
    preview = models.ImageField(upload_to='template_previews/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.category})"
