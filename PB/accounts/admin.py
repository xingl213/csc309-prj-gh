from django.contrib import admin

# Register your models here.
from django.contrib.auth.models import User

from accounts.models import CreditCardChange, Enrollment, SubscriptionPlan, \
    SubscriptionPlanChange, UserProfile

admin.site.register(UserProfile)
admin.site.register(SubscriptionPlan)
admin.site.register(CreditCardChange)
admin.site.register(SubscriptionPlanChange)
admin.site.register(Enrollment)

