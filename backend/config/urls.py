from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from projects.views import PosterProjectViewSet, TemplateViewSet
from uploads.views import UploadedAssetViewSet

router = DefaultRouter()
router.register(r'projects', PosterProjectViewSet, basename='posterproject')
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'assets', UploadedAssetViewSet, basename='uploadedasset')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
