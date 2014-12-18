import re

import requests
from bs4 import BeautifulSoup
from django.utils.html import strip_tags
from django.core.management.base import BaseCommand

import flowers.models as models

TOC_URL = r"http://fleursdumal.org/alphabetical-listing"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
}

POEM_PRINT_URL = r"http://fleursdumal.org/poem/%s/print/"  # % poem_id


class Command(BaseCommand):
    def handle(self, *args, **options):
        #Go to print urls and parse them
        #Add them to DB
        print_urls = self.get_print_urls()
        restart = False
        for index, url in enumerate(print_urls):
            print index, "/", len(print_urls)
            if "140" in url:
                restart = True

            if restart:
                self.handle_url(url)

    def get_print_urls(self):
        res = requests.get(TOC_URL, headers=HEADERS)
        poem_ids = re.findall('href="poem/(\d+)"', res.text)
        return [POEM_PRINT_URL % poem_id for poem_id in poem_ids]

    def handle_url(self, url):
        print url
        res = requests.get(url, headers=HEADERS)
        try:
            original_poem_name, english_canonical_name = re.findall("<h3>(.*) \((.+)\).*</h3>", res.text)[0]
        except:
            english_canonical_name = original_poem_name = re.findall("<h3>(.*) .*</h3>", res.text)[0]

        #Scrapping code looks so bad:
        poems_block = res.text.split("<hr")[1]
        poems_block = poems_block.split("\n")[2]
        poems_list = poems_block.replace("\r", "").split("<p><b>")
        poems_list = [i for i in poems_list if i]

        poem_obj = models.Poem(name=english_canonical_name, link=url)

        for index, poem_block in enumerate(poems_list):
            poem_parts = poem_block.split("</p><p>")
            poem_name_line, poem_stanzas, poem_meta_line = poem_parts[0], poem_parts[1:-1], poem_parts[-1]
            poem_name_line = strip_tags(poem_name_line)
            poem_text = "\n".join(poem_stanzas).replace("<br>", "\n")
            poem_meta_line = poem_meta_line.replace("&mdash; ", "")
            author = strip_tags(poem_meta_line.split(",")[0])

            try:
                year = re.findall("(\d{4})", poem_meta_line)[0]
            except:
                year = None
            print year, author

            if index == 0:
                language, is_original = "French", True
            else:
                language, is_original = "English", False

            translation_obj = models.PoemTranslation(name=poem_name_line,
                                                     text=poem_text,
                                                     language=language,
                                                     is_original_french=is_original,
                                                     year=year,
                                                     author=author,
                                                     meta_line=poem_meta_line,
                                                     poem=poem_obj)
            translation_obj.save()

            if index == 0:
                poem_obj.original = translation_obj
                poem_obj.save()
                translation_obj.poem = poem_obj
                translation_obj.save()
            else:
                poem_obj.translations.add(translation_obj)

        poem_obj.save()
        return poem_obj










