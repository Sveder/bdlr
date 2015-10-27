import os
import json

from django.conf import settings
from django.http.response import HttpResponse
from django.shortcuts import render, render_to_response

import models
import spritesheet_lib

def chunk_to_pages(chunk):
    chunk_pages = [(1, 3),
                   (4, 8),
                   (9, 12),
                   (13, 14)]

    return chunk_pages[chunk-1]


def index(request, page=0):
    if not page:
        page = 0

    d = {"first_chunk": generate_chunk_json(1),
         "start_page" : page,}
    return render_to_response("mvp_note.html", dictionary=d)


def generate_css(request, chunk_index):
    first_page, last_page = chunk_to_pages(int(chunk_index))

    name_to_image_path = {}
    for i in xrange(first_page, last_page + 1):
        image_path = os.path.join(settings.PAINTINGS_DIR, "%s.jpg" % i)
        name_to_image_path["%s" % i] = image_path

        painting = models.Painting(path=image_path)
        painting.save()
        models.Poem.objects.get(ordinal=i).image.add(painting)
        models.Poem.objects.get(ordinal=i).save()

    css = spritesheet_lib.create_sprite_css(name_to_image_path, chunk_index)
    return HttpResponse(css, content_type="text/css")


def json_chunk(request, chunk_ordinal):
    chunk = generate_chunk_json(chunk_ordinal)
    return HttpResponse(chunk, content_type="application/json")


def generate_chunk_json(chunk_ordinal):
    first_page, last_page = chunk_to_pages(int(chunk_ordinal))
    pages = []

    for poem in models.Poem.objects.filter(ordinal__gte=first_page, ordinal__lte=last_page):
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