from django.conf import settings
from django.contrib import admin
from django.urls import re_path
from django.conf.urls.static import static

from flowers import views

urlpatterns = [
    re_path(r'^(?P<page>[0-9]*)$', views.index, name='index'),
    re_path(r"css/sprite_sheet_(\d+).css", views.generate_css, name="generate_css"),
    re_path(r"api/json_chunk/(\d+)", views.json_chunk, name="json_chunk"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)