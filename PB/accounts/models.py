from django.contrib.auth.models import User
from django.db import models
from django.db.models import CASCADE
from studios.models import ClassInstance

def nameFile(instance, filename):
    return '/'.join(['images', 'UserProfile', filename])


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_num = models.CharField(max_length=12, null=True, blank=True)
    avatar = models.ImageField(upload_to=nameFile, null=True,
                               blank=True)
    address = models.CharField(max_length=200)  # addresses aren't verified here
    postal_code = models.CharField(max_length=50)
    province = models.CharField(max_length=2)

    def __str__(self):
        return self.user.username  # should we make it username?


class SubscriptionPlan(models.Model):
    price = models.IntegerField()
    interval = models.CharField(max_length=1)  # "M" for monthly, "Y" for yearly, "D" for daily
    deleted = models.BooleanField()


class CreditCardChange(models.Model):
    user = models.ForeignKey(to=UserProfile, on_delete=CASCADE)
    credit_card_num = models.CharField(max_length=20)
    date_of_change = models.DateTimeField(auto_now_add=True)  # When testing, remove auto_now_add so we can specify change date
    card_code = models.CharField(max_length=3)
    card_expr = models.CharField(max_length=5)


class SubscriptionPlanChange(models.Model):
    user = models.ForeignKey(to=UserProfile, on_delete=CASCADE)
    date_of_change = models.DateTimeField(auto_now_add=True)  # When testing, remove auto_now_add so we can specify change date
    to_subscription_plan = models.ForeignKey(to=SubscriptionPlan,
                                             on_delete=CASCADE)
    status = models.CharField(max_length=1)  # 'S' means user updates/starts subscription. 'C' means user cancels most recent subscription

    def __str__(self):
        return f' subscription {self.id} of {self.user.user.username}'  # should we make it username?


# This model tracks all the enrollment relationship between user and an instance of a class. Example:
#
# user    cls_instance
# --------------------
# 1       1
# 1       2
# 1       3
# ...       ...
class Enrollment(models.Model):
    user = models.ForeignKey(to=UserProfile, on_delete=CASCADE)
    cls_instance = models.ForeignKey(to=ClassInstance, on_delete=CASCADE)
