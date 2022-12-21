from django.contrib import admin
from studios.models import Amenity, Image, Studio, Class, ClassInstance, \
    ClassKeywords, Base64Image

admin.site.register(Image)
admin.site.register(Studio)
admin.site.register(Amenity)
admin.site.register(Class)
admin.site.register(ClassInstance)
admin.site.register(ClassKeywords)
admin.site.register(Base64Image)
