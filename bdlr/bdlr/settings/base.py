"""
Django settings for bdlr project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

from secret import *

import appenlight_client.client as e_client
APPENLIGHT = e_client.get_config({'appenlight.api_key': APPENLIGHT_PRIVATE_KEY})

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
PAINTINGS_DIR = os.path.join(ASSETS_DIR, "paintings")

STATIC_DIR = os.path.join(BASE_DIR, "static")
SPRITE_SHEET_DIR = os.path.join(STATIC_DIR, "spritesheet")

SPRITE_SHEET_FILETYPE = "png"

MAIN_CACHE_LENGTH = 60 * 60 * 24

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'waffle',

    'flowers',
)

MIDDLEWARE_CLASSES = (
    'appenlight_client.django_middleware.AppenlightMiddleware',

    'django.middleware.gzip.GZipMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'waffle.middleware.WaffleMiddleware',
)

ROOT_URLCONF = 'bdlr.urls'

WSGI_APPLICATION = 'bdlr.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(ASSETS_DIR, 'db.sqlite3'),
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = (
    STATIC_DIR,
)

TEMPLATE_DIRS = (r"C:\work\bdlr\bdlr\bdlr\templates", )
