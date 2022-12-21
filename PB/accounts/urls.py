from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView, \
    TokenObtainPairView

from accounts.views import EnrollClassAPI, ProfilePaymentEdit, \
    FuturePaymentView, SubscriptionChange, PaymentHistoryView, ProfileEdit, ProfileView, SignUpAPI, UserScheduleView, AllSubscriptions, UserSubscriptionSerializer,  UserIdView, IsEnrolledView
app_name = 'accounts'

urlpatterns = [
    path('api/signup/', SignUpAPI.as_view(), name='api-signup'),
    path('api/login/', TokenObtainPairView.as_view(), name='login'),
    path('profile/view/', ProfileView.as_view(),
         name='profile-view'),
    path('profile/edit/', ProfileEdit.as_view(),
         name='profile-edit'),
     path('is_enrolled/', IsEnrolledView.as_view(),
         name='is_enrolled'),
    path('profile/edit-payment/', ProfilePaymentEdit.as_view(),
         name='profile-edit-payment'),
    path('subscription/change/', SubscriptionChange.as_view(),
         name='subscription-change'),
    path('enroll/', EnrollClassAPI.as_view(), name='enroll'),
    path('payment-history/', PaymentHistoryView.as_view()),
     path('all_subscriptions/', AllSubscriptions.as_view()),
     path('future-payment/', FuturePaymentView.as_view()),
    path('subscription/', UserSubscriptionSerializer.as_view()),
     path('classes/schedule/', UserScheduleView.as_view()),
     path('userid/', UserIdView.as_view())
]

