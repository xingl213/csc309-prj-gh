from datetime import datetime
from dateutil.relativedelta import *
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import EmptyPage, Paginator
from django.http import JsonResponse
from requests import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import CreateAPIView, DestroyAPIView, \
    RetrieveAPIView, UpdateAPIView, get_object_or_404, ListAPIView
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.models import SubscriptionPlanChange, UserProfile, Enrollment, \
    CreditCardChange, SubscriptionPlan
from accounts.serializers import CardChangeSerializer, EnrollClassSerializer, \
    UpdateUserSerializer, UserProfileSerializer, UserSerializer, \
    SubscriptionChangeSerializer, SubscriptionSerializer, UserSubscriptionSerializer
from .pagination import CustomNumberPagination
from studios.models import ClassInstance
from studios.serializers import ClassInstanceSerializer
import json
from django.http import HttpResponseNotFound
from rest_framework.parsers import MultiPartParser, FormParser
import base64
import json

from django.core.files.base import ContentFile


# permission class made for users to only access pages related to themselves and
# no one else
class UserPermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        profile = UserProfile.objects.get(user=user)

        if profile.id == view.kwargs['id']:
            return True
        return False


class CreditPermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        profile = UserProfile.objects.get(user=user)

        payment = CreditCardChange.objects.filter(user=profile)

        if payment:
            return True
        return False


class SubscribedPermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user
        profile = UserProfile.objects.get(user=user)

        all_subs_S = SubscriptionPlanChange.objects.filter(user=profile, status="S")
        all_subs_C = SubscriptionPlanChange.objects.filter(user=profile, status="C")
        last_S = None
        for sub in all_subs_S:
            last_S = sub
        last_C = None
        for sub in all_subs_C:
            last_C = sub
        if last_S:
            subscription = last_S.to_subscription_plan
            interval = subscription.interval
            added_date = relativedelta(days=1)
            if interval == "M":
                added_date = relativedelta(months=1)
            if interval == "Y":
                added_date = relativedelta(years=1)
            # and todays date is less than last_C date + interval of subscription
            if (not last_C and last_S) or (last_C and last_S and last_C.date_of_change
                                        < last_S.date_of_change) or (last_C and
                                                                        last_S and
                            datetime.now() < last_C.date_of_change + added_date):
                return True
        return False


# view for user to view their profile information
class ProfileView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated] #TODO: removed user permission

    def get_object(self):
        user = self.request.user
        return User.objects.get(id=user.id)


# view for user to edit their profile information
class ProfileEdit(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UpdateUserSerializer
    queryset = User.objects.all()

    def update(self, request, *args, **kwargs):
        # username errors
        errors = []
        if(request.data.get("username") == ''):
            errors.append({'username': "username cannot be blank."})
        if errors:
            raise ValidationError(errors)
        instance = User.objects.get(id=request.user.id)
        instance_name = User.objects.get(username= request.data.get("username"))
        if (instance and instance_name.id != request.user.id):
            errors.append({'username': "username has been already taken."})
        if errors:
            raise ValidationError(errors)
        serializer = self.get_serializer(instance, request.data)
        serializer.is_valid(raise_exception=True)

        instance.save()

        profile = UserProfile.objects.get(user=instance)
        profile_info = request.data.get("profile")

        serializer_p = UserProfileSerializer(profile, profile_info)
        serializer_p.is_valid(raise_exception=True)
        format, imgstr = profile_info.get('avatar').split(';base64,')
        ext = format.split('/')[-1]
        data = ContentFile(base64.b64decode(imgstr), name='temp.' + ext)


        profile.province = profile_info["province"]
        profile.phone_num = profile_info["phone_num"]
        profile.address = profile_info["address"]
        profile.avatar = data
        profile.postal_code = profile_info["postal_code"]
        serializer_p.save()

        self.perform_update(serializer)

        return Response(serializer.data)

class AllSubscriptions(ListAPIView):
    serializer_class = SubscriptionSerializer
    queryset =  SubscriptionPlan.objects.all()


class UserSubscriptionSerializer(RetrieveAPIView):
    # TODO: add permissions
    serializer_class =UserSubscriptionSerializer

    #want the last active subscription plan
    def get_object(self):
        user = self.request.user
        profile = UserProfile.objects.get(user=user)
        changes_s = SubscriptionPlanChange.objects.filter(user=profile, status = "S") # all the credit card changes
        last_s = None
        for change in changes_s:
            last_s = change

        changes_c = SubscriptionPlanChange.objects.filter(user=profile, status = "C") # all the credit card changes
        last_c = None
        for change in changes_c:
            last_c = change

        print("GOT THIS")
        # print(last_s.date_of_change)
        # print(last_c.date_of_change)
        # need to change to DateTimeField

        if((last_c and last_s and last_s.date_of_change > last_c.date_of_change) or (not last_c and last_s)):
            print("HERE")
            return last_s.to_subscription_plan
        return None

class UserIdView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request, format=None):
        user = self.request.user
        profile = UserProfile.objects.get(user=user)
        return Response(profile.id)

# any user can signup
class SignUpAPI(CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class ProfilePaymentEdit(RetrieveAPIView, CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CardChangeSerializer

    # gets the most recent credit card info and displays it
    def get_object(self):
        user = self.request.user
        profile = UserProfile.objects.get(user=user)
        changes = CreditCardChange.objects.filter(user=profile) # all the credit card changes
        last = None
        for change in changes:
            last = change
        return last


class SubscriptionChange(RetrieveAPIView, CreateAPIView):
    permission_classes = [IsAuthenticated, CreditPermission]
    serializer_class = SubscriptionChangeSerializer

    # gets the most recent subscription info and displays it
    def get_object(self):
        user = self.request.user
        profile = UserProfile.objects.get(user=user)
        changes = SubscriptionPlanChange.objects.filter(user=profile) # all the credit card changes
        last = None
        for change in changes:
            last = change
        return last


class EnrollClassAPI(CreateAPIView, DestroyAPIView):
    permission_classes = [IsAuthenticated, SubscribedPermission]
    serializer_class = EnrollClassSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.request.user
        profile = UserProfile.objects.get(user=user)
        serializer = EnrollClassSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        cls_instance = ClassInstance.objects.get(id=self.request.data['cls_instance'])
        cls = cls_instance.cls

        try:
            first_enrolled = Enrollment.objects.get(user=profile, cls_instance=cls_instance)
        except ObjectDoesNotExist:
            raise ValidationError({'cls_instance':'User not enrolled in class.'})
        # get all future instances that user is enrolled
        print(request.data)
        chosen_enrl= Enrollment.objects.get(user= profile, cls_instance= cls_instance)
        if chosen_enrl:
            cls_instance.num_enrolled -= 1
            cls_instance.save()
            chosen_enrl.delete()
        all_instances = ClassInstance.objects.filter(cls=cls)
        all_instances_f = []
        for inst in all_instances:
            if inst.start_datetime > datetime.now(inst.start_datetime.tzinfo):
                all_instances_f.append(inst)
        enrolled = None
        print(request.data['recurring'])
        print(all_instances_f)
        if request.data['recurring'] is True:
            print("RECURRRING")
            for inst in all_instances_f:
                try:
                    enrolled = Enrollment.objects.filter(user=profile, cls_instance=inst)
                except:
                    enrolled = None
                if enrolled:
                    inst.num_enrolled -= 1
                    cls_instance.save()
                    enrolled.delete()
        return Response(status=status.HTTP_200_OK)

class IsEnrolledView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = UserProfile.objects.get(user=request.user).id
        cls_instance = request.GET.get('cls_instance')

        enrollment = Enrollment.objects.all().filter(cls_instance=cls_instance, user=user)

        if len(enrollment) > 0:
            return Response(True)
        return Response(False)


class PaymentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = UserProfile.objects.get(user=request.user).id
        get_object_or_404(UserProfile, id=user_id)

        plan_changes = SubscriptionPlanChange.objects.filter(user=user_id).order_by('date_of_change')
        plan_changes_list = []
        for pc in plan_changes:
            plan_changes_list.append(pc)
        payment_list = []

        if len(plan_changes_list) == 0:
            return JsonResponse(payment_list, safe=False)

        card_changes = CreditCardChange.objects.filter(user=user_id).order_by('date_of_change')
        card_changes_list = []
        for cc in card_changes:
            card_changes_list.append(cc)
        i = 0
        while i < len(plan_changes_list):
            spc = plan_changes[i]
            if spc.status == 'C':
                i += 1
            else:
                curr_plan_start_date = spc.date_of_change
                curr_plan_end_date = None
                if i == len(plan_changes_list) - 1:
                    curr_plan_end_date = datetime.now()
                else:
                    curr_plan_end_date = plan_changes[i + 1].date_of_change

                # get current plan information (price, interval)
                curr_plan = SubscriptionPlan.objects.get(id=spc.to_subscription_plan.id)
                price = curr_plan.price
                interval = curr_plan.interval

                payment_date = curr_plan_start_date
                while payment_date.date() <= curr_plan_end_date.date():
                    # get credit card number used on payment_date
                    credit_card_num = None
                    for j in range(1, len(card_changes_list)):
                        credit_card = card_changes_list[j]
                        if credit_card.date_of_change > payment_date:
                            credit_card_num = card_changes_list[j - 1].credit_card_num
                            break
                    if credit_card_num is None:
                        credit_card_num = card_changes_list[-1].credit_card_num
                    payment_list.append({
                        "amount": price,
                        "credit_card_num": credit_card_num,
                        "date": payment_date.date(),
                    })

                    if interval == 'D':
                        payment_date += relativedelta(days=1)
                    elif interval == 'M':
                        payment_date += relativedelta(months=1)
                    else:  # interval == 'Y'
                        payment_date += relativedelta(years=1)

                i += 1

        # display from latest payment to oldest
        payment_list.reverse()

        # pagination: return 5 entries per page
        p = Paginator(payment_list, 5)
        page_num = int(request.GET.get('page'))
        ph_list_paginated = None
        try:
            ph_list_paginated = p.page(int(page_num))
            ph_list_paginated_serializable = []
            for ci in ph_list_paginated:
                ph_list_paginated_serializable.append(ci)
            return JsonResponse(ph_list_paginated_serializable, safe=False)
        except EmptyPage:
            return JsonResponse([], safe=False)


class FuturePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = UserProfile.objects.get(user=request.user).id
        get_object_or_404(UserProfile, id=user_id)

        next_payment = {"amount": None, "credit_card_num": None, "date": None}
        try:
            spc = SubscriptionPlanChange.objects.filter(user=user_id).latest('date_of_change')
        except ObjectDoesNotExist:
            spc = None
        if spc is None or spc.status == 'C':  # user isn't subscribed or has cancelled subscription
            return JsonResponse([], safe=False)

        subscription_plan = SubscriptionPlan.objects.get(id=spc.to_subscription_plan.id)
        credit_card = CreditCardChange.objects.filter(user=user_id).latest('date_of_change')
        next_payment_date = spc.date_of_change
        increment = None
        if subscription_plan.interval == 'D':
            increment = relativedelta(days=1)
        elif subscription_plan.interval == 'M':
            increment = relativedelta(months=1)
        else:
            increment = relativedelta(years=1)
        while next_payment_date.date() <= datetime.now().date():
            next_payment_date += increment

        next_payment['amount'] = subscription_plan.price
        next_payment['credit_card_num'] = credit_card.credit_card_num
        next_payment['date'] = next_payment_date.date()
        return JsonResponse([next_payment], safe=False)


class UserScheduleView(APIView, CustomNumberPagination):

    permission_classes = [IsAuthenticated]
    pagination_class = CustomNumberPagination

    def get(self, request, *args, **kwargs):
        user_id = UserProfile.objects.get(user=request.user).id
        # class enrollments that map to current user
        enrollments = Enrollment.objects.all().filter(user=user_id)

        foreign_keys = []

        for enrollment in enrollments:
            foreign_keys.append(enrollment.cls_instance)

        qs = ClassInstance.objects.none()

        for cli in foreign_keys:
            qs = qs | ClassInstance.objects.all().filter(id = cli.id).filter(cancelled = False)

        qs = qs.order_by('start_datetime__year', 'start_datetime__month', 'start_datetime__day', 'start_datetime__hour', 'start_datetime__minute', 'start_datetime__second')
        serialized = ClassInstanceSerializer(qs, many=True)
        page = self.paginate_queryset(qs, request)
        if page is not None:
            serialized = ClassInstanceSerializer(page, many=True)
            return self.get_paginated_response(serialized.data)
        return HttpResponseNotFound(json.dumps({'response': 'Not found.'}), content_type='application/json')

