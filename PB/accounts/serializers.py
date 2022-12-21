from datetime import datetime
from dateutil.relativedelta import relativedelta
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.core.validators import RegexValidator
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CurrentUserDefault
from rest_framework.serializers import ModelSerializer
import base64
import json

from django.core.files.base import ContentFile

from studios.models import Class, ClassInstance
from .models import CreditCardChange, Enrollment, SubscriptionPlan, \
    SubscriptionPlanChange, \
    UserProfile


#TODO: add refrence
class Base64ImageField(serializers.ImageField):

    def to_internal_value(self, data):
        from django.core.files.base import ContentFile
        import base64
        import six
        import uuid

        if isinstance(data, six.string_types):
            if 'data:' in data and ';base64,' in data:
                header, data = data.split(';base64,')

            try:
                decoded_file = base64.b64decode(data)
            except TypeError:
                self.fail('invalid_image')

            file_name = str(uuid.uuid4())[:12] # 12 characters are more than enough.
            file_extension = self.get_file_extension(file_name, decoded_file)
            complete_file_name = "%s.%s" % (file_name, file_extension, )
            data = ContentFile(decoded_file, name=complete_file_name)

        return super(Base64ImageField, self).to_internal_value(data)

    def get_file_extension(self, file_name, decoded_file):
        import imghdr

        extension = imghdr.what(file_name, decoded_file)
        extension = "jpg" if extension == "jpeg" else extension

        return extension

class SubscriptionSerializer(ModelSerializer):
    id = serializers.ModelField(model_field=SubscriptionPlan()._meta.get_field('id'))
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'price', 'interval', 'deleted']


class UserSubscriptionSerializer(ModelSerializer):
    id = serializers.ModelField(model_field=SubscriptionPlan()._meta.get_field('id'))
    class Meta:
        model = SubscriptionPlan
        fields = ['id']


class UserProfileSerializer(ModelSerializer):

    avatar = Base64ImageField(max_length=None, use_url=True)

    class Meta:
        model = UserProfile
        fields = ['phone_num', 'avatar', 'address', 'postal_code', 'province']

    def validate(self, attrs):
        print("IN PROFILE")
        errors = []
        validate_phone = RegexValidator(r'\d\d\d-\d\d\d-\d\d\d\d')
        postal_code = RegexValidator(r'^[A-Z]\d[A-Z]\d[A-Z]\d$')
        province = RegexValidator(r'[A-Z][A-Z]')
        try:
            validate_phone(attrs['phone_num'])
        except Exception:
            errors.append({'phone_num': 'Enter a valid phone number'})
        try:
            postal_code(attrs['postal_code'])
        except Exception:
            errors.append({'postal_code': 'Enter a valid postal code'})
        try:
            province(attrs['province'])
        except Exception:
            errors.append({'province': 'Enter a valid province'})
        if errors:
            raise ValidationError(errors)
        return attrs


class UserSerializer(serializers.ModelSerializer):

    profile = UserProfileSerializer()
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'password',
                  'email', 'profile', 'password2')

    def create(self, validated_data):
        validated_data.pop('password2')
        password = make_password(validated_data.pop('password'))
        profile_data = validated_data.pop('profile')

        
        user = User.objects.create(**validated_data, password=password)
        profile = UserProfile.objects.create(**profile_data, user=user)
        return user

    def validate(self, attrs):
        errors = []
        pass_rejex = RegexValidator(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$')
        try:
            pass_rejex(attrs['password'])
        except:
            errors.append({'password': "Password must match criteria"})
        if attrs['password'] != attrs['password2']:
            errors.append({"password": "Password fields didn't match."})
        if User.objects.filter(username=attrs['username']).exists():
            errors.append({'username': "This username is taken."})
        if User.objects.filter(email=attrs['email']).exists():
            errors.append({'email': "An account with this email already exists."})
        if errors:
            raise ValidationError(errors)
        return attrs


class UpdateUserSerializer(serializers.ModelSerializer):
    #profile = UserProfileSerializer(required=False)
    password2 = serializers.CharField(read_only=True, required=False)
    #avatar = Base64ImageField(max_length=None, use_url=True, required=False, allow_empty_file=True)
    username = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'password',
                  'email', 'password2')


    def validate(self, attrs):
        errors = []
        print("IN SERIALIZER")
        data = self.initial_data
        if data['password'] != data['password2']:
            errors.append({"password": "Password fields didn't match."})
        if errors:
            raise ValidationError(errors)
        return attrs



class CardChangeSerializer(serializers.ModelSerializer):

    class Meta:
        model = CreditCardChange
        fields = ('user', 'credit_card_num', 'card_code', 'card_expr')

    # creates a new credit card change
    def create(self, validated_data):
        u = validated_data.pop('user')
        change = CreditCardChange.objects.create(**validated_data, user=u)
        return change

    def validate(self, attrs):
        card_code = RegexValidator(r'\d\d\d')
        card_expr = RegexValidator(r'\d\d/\d\d')
        credit_card_num = RegexValidator(r'\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d')
        errors = []
        # check for duplicate
        try:
            card_code(attrs['card_code'])
        except Exception:
            errors.append({'card_code': 'Enter a valid card code'})
        try:
            card_expr(attrs['card_expr'])
        except Exception:
            errors.append({'card_expr': 'Enter a valid card expiry date'})
        try:
            credit_card_num(attrs['credit_card_num'])
        except Exception:
            errors.append({'credit_card_num': 'Enter a valid card number'})
        card = attrs['credit_card_num']
        u = attrs['user']
        request_user = self.context['request'].user
        if u.user.username != request_user.username:
            errors.append({'user': 'You do not have permissions to edit this page.'})
        code = attrs['card_code']
        exp = attrs['card_expr']
        rows = CreditCardChange.objects.filter(user=u)
        last = None
        for row in rows:
            last = row
        if last and last.credit_card_num == card and last.card_expr == exp and \
                last.card_code == code:
            errors.append({'user': 'Payment info up to date'})
        if errors:
            raise ValidationError(errors)
        return attrs
    # TODO: narrow down exceptions


class SubscriptionChangeSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(
        slug_field='id',
        queryset=UserProfile.objects.all()
    )

    class Meta:
        model = SubscriptionPlanChange
        fields = ('user', 'date_of_change', 'to_subscription_plan', 'status')

    def create(self, validated_data):
        # in this case a subscription plan is being created
        status = validated_data.pop('status')
        to_subscription_plan_data = validated_data.pop('to_subscription_plan')
        user = validated_data.pop('user')
        subscription = SubscriptionPlan.objects.get(id=to_subscription_plan_data.id)
        if status == 'S':
            subs = SubscriptionPlanChange.objects.filter(user=user, status="S")
            last = None
            for s in subs:
                last = s
            # check if the last subscription plan wasnt canclled
            if last:
                last_cancelleds = SubscriptionPlanChange.objects.filter(user=user, status="C")
                last_cancelled = None
                for c in last_cancelleds:
                    last_cancelleds = c
                if last_cancelled:
                    #add row for last subscprition being cancelled
                    # SubscriptionPlanChange.objects.create(user=user,to_subscription_plan=last.to_subscription_plan,
                    #                                       status="C")
                    last_cancelled.delete()
            # add row for new started subscription
            sub = SubscriptionPlanChange.objects.create(user=user,to_subscription_plan= to_subscription_plan_data,
                                                  status="S")
            return sub
        if status == 'C':
            # user wants to cancel current subscription
            # must add one more row for this instance with status C
            sub_c = SubscriptionPlanChange.objects.create(user=user, to_subscription_plan = to_subscription_plan_data,
                                                  status=status)
            # cancel all classes after that


            all_subs_S = SubscriptionPlanChange.objects.filter(user=user, status="S")
            last_S = None
            for sub in all_subs_S:
                last_S = sub
            subscription = last_S.to_subscription_plan
            interval = subscription.interval
            added_date = relativedelta(days=1)
            if interval == "M":
                added_date = relativedelta(months=1)
            if interval == "Y":
                added_date = relativedelta(years=1)
            date_subscribed = last_S.date_of_change
            last_active_date = date_subscribed
            while last_active_date < datetime.now(last_active_date.tzinfo):
                last_active_date += added_date

            enrolled_cls = Enrollment.objects.filter(user=user)
            for cls in enrolled_cls:
                cls_inst = cls.cls_instance
                cls_date = cls_inst.start_datetime
                if last_active_date < cls_date:
                    cls.delete()
                    cls.num_enrolled -= 1
                    cls.save()
            return sub_c

    def validate(self, attrs):
        errors = []
        profile = attrs['user']
        to_subscription_plan = attrs['to_subscription_plan']
        status = attrs['status']
        request_user =self.context['request'].user
        if profile.user.username != request_user.username:
            errors.append({'user': 'You do not have permissions to edit this page.'})
        subscribed_S = SubscriptionPlanChange.objects.filter(user=profile,
                                                           to_subscription_plan = to_subscription_plan,
                                                           status='S')
        subscribed_C = SubscriptionPlanChange.objects.filter(user=profile,
                                                             to_subscription_plan = to_subscription_plan,
                                                             status='C')
        last_S = None
        last_C = None
        for sub in subscribed_S:
            last_S = sub
        for sub in subscribed_C:
            last_C = sub

        # cannot cancel a subscription plan that does not exist
        if (not subscribed_S and status == "C"):
            errors.append({'to_subscription_plan':
                               'cannot cancel a subscription that has not been started'})
        if ((last_S and last_C and last_S.date_of_change > last_C.date_of_change)) and status == "S":
            # if they are the same subscription plan, cancellation must be after
            # start or not no cancellation then user has duplicates
            errors.append({'user': 'user is already subscribed.'})
        if (last_S and last_C and last_S.date_of_change < last_C.date_of_change) and status == "C":
            # if they are the same subscription plan, cancellation must be after
            # start or not no cancellation then user has duplicates
            errors.append({'user': 'user has already cancelled.'})
        if errors:
            raise ValidationError(errors)

        return attrs
        # validate that most recent change isnt the one with same info


class EnrollClassSerializer(serializers.ModelSerializer):
    recurring = serializers.BooleanField(write_only=True)

    class Meta:
        model = Enrollment
        fields = ['user', 'cls_instance', 'recurring']

    def create(self, validated_data):
        # get class itself from cls_instance
        user = validated_data.pop('user')
        cls_instance = validated_data.pop('cls_instance')
        cls = cls_instance.cls
        recurring = validated_data.pop('recurring')
        # enroll in all instances of this class if they are available
        if recurring:
            # get all instances of the cls
            all_cls = ClassInstance.objects.filter(cls=cls)
            all_greater = []
            # only class after the chosen class_instance can be added that the
            # user is not already enrolled in
            for c in all_cls:
                enrollment = Enrollment.objects.filter(cls_instance=c.id, user=user)
                if c.start_datetime >= cls_instance.start_datetime and not enrollment:
                    all_greater.append(c)
            enroll = None
            for c in all_greater:
                if cls.capacity > c.num_enrolled and c.start_datetime > datetime.now(c.start_datetime.tzinfo):
                    c.num_enrolled += 1
                    c.save()
                    enroll = Enrollment.objects.create(user=user, cls_instance=c)
            if enroll:
                return enroll
            raise ValidationError({'cls_instance':'No class is available'})
        # otherwise enroll in only one instance of the class if it is available
        else:
            if cls.capacity > cls_instance.num_enrolled and cls_instance.start_datetime > \
                    datetime.now(cls_instance.start_datetime.tzinfo):
                cls_instance.num_enrolled += 1
                cls_instance.save()
                return Enrollment.objects.create(user=user, cls_instance=cls_instance)

    def validate(self, attrs):
        errors = []
        user = attrs['user']
        cls = attrs['cls_instance']
        c = Class.objects.get(id=cls.cls.id)
        enrolled = Enrollment.objects.filter(user=user, cls_instance=cls)
        request_user =self.context['request'].user
        req = self.context['request'].method
        reccuring = attrs['recurring']
        if user.user.username != request_user.username:
            errors.append({'user': 'You do not have permissions to edit this page.'})
        # validating whether user hasnt already enrolled in the class
        if enrolled and req != "DELETE" and not reccuring:
            errors.append({'user': 'user is already enrolled in class'})

        if c.capacity <= cls.num_enrolled and req != "DELETE" and not reccuring:
            errors.append({'cls_instance': 'capacity has been reached.'})

        # validating recurring being a Boolean value
        if not isinstance(attrs['recurring'], bool):
            errors.append({'recurring': 'Value should either be true or false'})

        if errors:
            raise ValidationError(errors)
        return attrs
