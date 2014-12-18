from django.db import models
from django.conf import settings


class BaseModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    changed = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class PoemTranslation(BaseModel):
    name = models.CharField(max_length=250)
    text = models.TextField()
    language = models.CharField(max_length=100, default="English")
    is_original_french = models.BooleanField(default=False)

    year = models.IntegerField(null=True)
    author = models.CharField(max_length=100, null=True)
    meta_line = models.TextField(null=True)

    poem = models.ForeignKey("Poem", null=True)
    importance = models.IntegerField(default=100)


class Painting(BaseModel):
    image = models.ImageField(null=True, upload_to=settings.PAINTINGS_DIR)
    path = models.CharField(max_length=200, null=True)


class Poem(BaseModel):
    name = models.CharField(max_length=200)
    original = models.ForeignKey(PoemTranslation, related_name="+")
    translations = models.ManyToManyField(PoemTranslation, related_name="+")
    ordinal = models.IntegerField(null=True)
    image = models.ManyToManyField(Painting)
    link = models.URLField()


class PoemChunk(BaseModel):
    poems = models.ManyToManyField(Poem)
    css_location = models.CharField(max_length=200, null=True)
    should_be_used = models.BooleanField(default=True)
    chunk_index = models.IntegerField()


    def get_count(self):
        return self.poems.all().count()
    count = property(fget=get_count)