import json

from django.http.response import HttpResponse
from django.shortcuts import render_to_response

import models
import spritesheet_lib


CHUNK_PAGES = [(1, 4),
               (5, 8),
               (9, 12),
               (13, 16),
               (17, 20),
               (21, 24),
               (25, 28),
               (29, 32),
               (33, 36),
               (37, 40),
               (41, 44),
               (45, 48),
               (49, 52),
               (53, 56),
               (57, 60),
               (61, 64),
               (65, 68),
               (69, 72),
               (73, 76),
               (77, 80),
               (81, 84),
               (85, 88),
               (89, 92),
               (93, 96),
               (97, 101),
               (102, 102),]


def chunk_to_pages(chunk):
    return CHUNK_PAGES[chunk]


def chunk_from_page(page_number):
    for chunk_start, chunk_end in CHUNK_PAGES:
        if chunk_start <= page_number <= chunk_end:
            return CHUNK_PAGES.index((chunk_start, chunk_end))

    return 0


def index(request, page=0):
    if not page:
        page = 0

    try:
        page = int(page)
    except:
        page = 0

    chunk = chunk_from_page(page)

    d = {"first_chunk"  : generate_chunk_json(chunk),
         "first_ordinal": chunk,
         "start_page"   : page,
         "chunk_count"  : len(CHUNK_PAGES),
         "page_count"   : max(CHUNK_PAGES[-1])}

    return render_to_response("mvp_note.html", dictionary=d)


def generate_css(request, chunk_index):
    first_page, last_page = chunk_to_pages(int(chunk_index))

    name_to_image_path = {}
    for i in xrange(first_page, last_page + 1):
        poem = models.Poem.objects.get(ordinal=i)
        painting = poem.image.last()
        name_to_image_path["%s" % i] = painting.path

    css = spritesheet_lib.create_sprite_css(name_to_image_path, chunk_index)
    return HttpResponse(css, content_type="text/css")


def json_chunk(request, chunk_ordinal):
    chunk = generate_chunk_json(chunk_ordinal)
    return HttpResponse(chunk, content_type="application/json")


def generate_chunk_json(chunk_ordinal):
    first_page, last_page = chunk_to_pages(int(chunk_ordinal))
    pages = []

    for poem in models.Poem.objects.filter(ordinal__gte=first_page, ordinal__lte=last_page).order_by("ordinal"):
        pages.append(_return_poem_dict(poem))

    chunk = { "chunk_index": chunk_ordinal,
              "chunk_start": first_page,
              "chunk_stop" : last_page,
              "page_count" : len(pages),
              "css"        : "sprite_sheet_%s.css" % chunk_ordinal,
              "pages"      : pages}

    return json.dumps(chunk)


def _return_poem_dict(obj):
    original_poem = obj.original
    original = { "author" : original_poem.author,
                 "text"   : original_poem.text,
                 "name"   : original_poem.name,
                 "year"   : original_poem.year, }

    translations = {}
    for t in obj.translations.all():
        d = { "author"     : t.author,
              "text"       : t.text,
              "name"       : t.name,
              "year"       : t.year,
              "importance" : t.importance}

        if t.language in translations:
            translations[t.language].append(d)
        else:
            translations[t.language] = [d]

    translations["original"] = original
    return translations
