from django.db import models
from django.db.models import CASCADE
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import datetime
from dateutil.relativedelta import *


class Studio(models.Model):
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=200)  # addresses aren't verified here
    postal_code = models.CharField(max_length=50)
    longitude = models.FloatField()
    latitude = models.FloatField()
    phone_number = models.CharField(max_length=12)
    main_image = models.ImageField(upload_to='studio_pics/')
    distance = models.FloatField(blank=True, null=True) # used for distance calculations

    def __str__(self):
        return f'{self.name} ({self.id})'


class Image(models.Model):
    image = models.ImageField(upload_to='studio_pics/')
    studio = models.ForeignKey(to=Studio, on_delete=CASCADE)

class Base64Image(models.Model):
    image_b64 = models.TextField()
    studio = models.ForeignKey(to=Studio, on_delete=CASCADE)

class Amenity(models.Model):
    type = models.CharField(max_length=200)
    numbers = models.IntegerField(blank=True, null=True)

    access_level = models.IntegerField()
    studio = models.ForeignKey(to=Studio, on_delete=CASCADE)


class Class(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()
    coach = models.CharField(max_length=50)
    capacity = models.PositiveIntegerField()
    studio = models.ForeignKey(to=Studio, on_delete=CASCADE)
    # these fields are used for auto-creating class instances
    start_date = models.DateField()
    end_date = models.DateField()  # inclusive
    frequency = models.CharField(max_length=1)  # 'D' for daily; 'W' for weekly; 'M' for monthly
    cls_start_time = models.TimeField()
    cls_end_time = models.TimeField()


# This model maps a keyword to a class. Example:
#
# keyword       cls
# -------------------
# upper-body    1
# core          1
# upper-body    2
# ...           ...
class ClassKeywords(models.Model):
    keyword = models.CharField(max_length=20)
    cls = models.ForeignKey(to=Class, on_delete=CASCADE)


# This model maps a time slot to an instance of a class.
# In the below example, class with id 1 happens every Monday from 9-10am.
# It starts on 2022/11/07 and ends on 2023/02/06. The instance on 2022/11/14
# was manually cancelled.
#
# start_datetime    end_datetime        cancelled   cls   num_enrolled
# --------------------------------------------------------------------
# 2022/11/07 9am    2022/11/07 10am     False       1     5
# 2022/11/14 9am    2022/11/14 10am     True        1     5
# 2022/11/21 9am    2022/11/21 10am     False       1     6
# ...               ...                 ...         ...   ...
# 2023/02/06 9am    2023/02/06 10am     False       1     5
class ClassInstance(models.Model):
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    cancelled = models.BooleanField(default=False)
    cls = models.ForeignKey(to=Class, on_delete=CASCADE)
    num_enrolled = models.IntegerField(default=0)


@receiver(post_save, sender=Class)
def create_class_instances(sender, instance, created, **kwargs):
    if created:
        start_date = instance.start_date
        end_date = instance.end_date
        frequency = instance.frequency
        cls_start_time = instance.cls_start_time
        cls_end_time = instance.cls_end_time

        increment = None
        if frequency == 'D':
            increment = relativedelta(days=1)
        elif frequency == 'W':
            increment = relativedelta(days=7)
        else:  # frequency == 'M'
            increment = relativedelta(months=1)

        cls_date = start_date
        while cls_date <= end_date:
            ClassInstance.objects.create(start_datetime=datetime.combine(cls_date, cls_start_time),
                                         end_datetime=datetime.combine(cls_date, cls_end_time),
                                         cls=instance)
            cls_date += increment
