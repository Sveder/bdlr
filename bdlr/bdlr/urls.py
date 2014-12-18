from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', 'flowers.views.index', name='index'),
    url(r'api/test$', 'flowers.views.api_get_json', name='api_get_json'),

    url(r"css/sprite_sheet_(\d+).css", 'flowers.views.generate_css', name="generate_css"),
    url(r"api/json_chunk/(\d+)", 'flowers.views.json_chunk', name="json_chunk"),


) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)