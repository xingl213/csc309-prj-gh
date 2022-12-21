from datetime import datetime
from datetime import date
from urllib import parse

from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import EmptyPage, Paginator
from django.http import HttpResponseBadRequest, JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.gis.geoip2 import GeoIP2
import geopy.distance
import pgeocode
import json
from django.urls import reverse_lazy
import base64

from accounts.models import Enrollment, UserProfile
from studios.models import Amenity, Class, ClassInstance, Studio, Image, Base64Image
from studios.serializers import ClassInstanceSerializer, StudioSerializer, AmenitySerializer, B64Serializer
from studios.pagination import CustomNumberPagination
from django.http import HttpResponseNotFound

from django.core.validators import RegexValidator
from rest_framework.exceptions import ValidationError


class StudioImagesView(APIView, CustomNumberPagination):
    """Paginates a set of images serialized as base64"""
    permission_classes = [IsAuthenticated]
    pagination_class = CustomNumberPagination

    def get(self, request, *args, **kwargs):
        studio_id = kwargs['studio_id']

        std = Studio.objects.all().filter(id = studio_id)
        if std.exists():
            pass
        else:
            return HttpResponseNotFound(json.dumps({'response': 'Not found.'}), content_type='application/json')

        # creating image set

        og_images = Image.objects.all().filter(studio = studio_id)

        for img in og_images:
            encoded = base64.b64encode(img.image.read())
            b64 = Base64Image()
            b64.image_b64 = encoded
            std = Studio.objects.all().filter(id = studio_id)
            b64.studio = std[0]
            if Base64Image.objects.all().filter(studio = studio_id).filter(image_b64 = encoded).exists():
                pass
            else:
                b64.save()

        # getting base 64 images

        b64_imgs = Base64Image.objects.all().filter(studio = studio_id)

        og_encoded = base64.b64encode(Studio.objects.all().filter(id = studio_id)[0].main_image.read())
        if Base64Image.objects.all().filter(studio = studio_id).filter(image_b64 = og_encoded).exists():
            pass
        else:
            b64 = Base64Image()
            b64.image_b64 = og_encoded
            std = Studio.objects.all().filter(id = studio_id)
            b64.studio = std[0]
            b64.save()

        # serializing and returning

        serialized = B64Serializer(b64_imgs, many=True)
        page = self.paginate_queryset(b64_imgs, request)
        if page is not None:
            serialized = B64Serializer(page, many=True)
            return self.get_paginated_response(serialized.data)
        return HttpResponseNotFound(json.dumps({'response': 'Not found.'}), content_type='application/json')


class StudioAmenitiesView(APIView, CustomNumberPagination):
    """Paginates a set of amenities for a studio."""
    permission_classes = [IsAuthenticated]
    pagination_class = CustomNumberPagination

    def get(self, request, *args, **kwargs):
        studio_id = kwargs['studio_id']

        std = Studio.objects.all().filter(id = studio_id)
        if std.exists():
            pass
        else:
            return HttpResponseNotFound(json.dumps({'response': 'Not found.'}), content_type='application/json')

        # amenities that map to this studio

        amenities = Amenity.objects.all().select_related().filter(studio = studio_id)

        serialized = AmenitySerializer(amenities, many=True)
        page = self.paginate_queryset(amenities, request)
        if page is not None:
            serialized = AmenitySerializer(page, many=True)
            return self.get_paginated_response(serialized.data)
        return HttpResponseNotFound(json.dumps({'response': 'Not found.'}), content_type='application/json')


class StudioInfoView(APIView):
    """Returns info about a particular studio given studio id."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        studio_id = kwargs['studio_id']
        wanted = Studio.objects.filter(id=studio_id)
        response = {'name': 'NA', 'address': 'NA', 'postal_code': 'NA', 'phone_number': 'NA', 'directions': 'NA'}

        if wanted.exists():
            # building response
            response['name'] = wanted.values('name')[0]['name']
            response['address'] = wanted.values('address')[0]['address']
            response['postal_code'] = wanted.values('postal_code')[0]['postal_code']
            response['phone_number'] = wanted.values('phone_number')[0]['phone_number']
            longitude = wanted.values('longitude')[0]['longitude']
            latitude = wanted.values('latitude')[0]['latitude']

            # directions url building
            directions = f'https://www.google.com/maps?saddr=My+Location&daddr={latitude},{longitude}'
            response['directions'] = directions

            return JsonResponse(response, safe=False)
        else:
            # no matching studio exists
            return HttpResponseNotFound(json.dumps({'response': 'Not found.'}), content_type='application/json')

class ClosestStudioView(APIView, CustomNumberPagination):
    """Returns a list of studios, closest to furthest away."""
    permission_classes = [IsAuthenticated]
    pagination_class = CustomNumberPagination

    def get(self, request):
        longitude = request.GET.get("longitude")
        latitude = request.GET.get("latitude")
        postal_code = request.GET.get("postal_code")
        closest = Studio.objects.all()

        if longitude is None and latitude is None and postal_code is None:
            # use the user's ip
            # source = https://stackoverflow.com/questions/4581789/how-do-i-get-user-ip-address-in-django

            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')

            if ip == "127.0.0.1":
                # this doesn't work if we make a request from the same machine running the dev server
                # set to a uoft ip
                ip = "128.100.31.200"

            g = GeoIP2()
            coords = g.coords(ip)

            for studio in closest:
                studio.distance = geopy.distance.geodesic((coords[1], coords[0]), (studio.latitude, studio.longitude)).kilometers
                studio.save()

        elif postal_code is None:

            errors = {}

            try:
                if float(latitude) < -90 or float(latitude) > 90:
                    errors['latitude'] = 'Enter a valid latitude'
            except:
                errors['latitude'] = 'Enter a valid latitude'

            try:
                if float(longitude) < -90 or float(longitude) > 90:
                    errors['longitude'] = 'Enter a valid longitude'
            except:
                errors['longitude'] = 'Enter a valid longitude'

            if len(errors) > 0:
                return HttpResponseBadRequest(json.dumps(errors), content_type='application/json')

            for studio in closest:
                studio.distance = geopy.distance.geodesic((float(latitude), float(longitude)), (studio.latitude, studio.longitude)).kilometers
                studio.save()

        else:

            errors = {}
            validator = RegexValidator(r'[A-Z][0-9][A-Z]\s[0-9][A-Z][0-9]')
            try:
                validator(postal_code)
            except:
                errors['postal_code'] = 'Enter a valid postal_code'

            if len(errors) > 0:
                return HttpResponseBadRequest(json.dumps(errors), content_type='application/json')

            nomi = pgeocode.Nominatim('ca')
            data = nomi.query_postal_code(postal_code)

            for studio in closest:
                studio.distance = geopy.distance.geodesic((data.latitude, data.longitude), (studio.latitude, studio.longitude)).kilometers
                studio.save()

        closest = closest.order_by('distance')
        page = self.paginate_queryset(closest, request)
        if page is not None:
            serialized = StudioSerializer(page, many=True)
            return self.get_paginated_response(serialized.data)
        return HttpResponseNotFound(json.dumps({'response': 'Not found.'}), content_type='application/json')


class StudioSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        studio_name = request.GET.get("studio_name")
        amenity = request.GET.get("amenity")
        class_name = request.GET.get("class_name")
        coach = request.GET.get("coach")
        page_num = int(request.GET.get("page"))

        studio_list = []
        all_studios = Studio.objects.all()

        if len(all_studios) == 0:
            return JsonResponse([], safe=False)

        studio_name_compliant_set = set()
        if studio_name is None:  # query parameter not given
            for studio in all_studios:
                studio_name_compliant_set.add(studio.id)
        else:
            studio_name_compliant = Studio.objects.filter(name__contains=studio_name)
            for studio in studio_name_compliant:
                studio_name_compliant_set.add(studio.id)

        amenity_compliant_set = set()
        if amenity is None:
            for studio in all_studios:
                amenity_compliant_set.add(studio.id)
        else:
            amenity_compliant = Amenity.objects.filter(type__contains=amenity)
            for am in amenity_compliant:
                amenity_compliant_set.add(am.studio.id)

        class_name_compliant_set = set()
        if class_name is None:
            for studio in all_studios:
                class_name_compliant_set.add(studio.id)
        else:
            class_name_compliant = Class.objects.filter(name__contains=class_name)
            for cls in class_name_compliant:
                class_name_compliant_set.add(cls.studio.id)

        coach_compliant_set = set()
        if coach is None:
            for studio in all_studios:
                coach_compliant_set.add(studio.id)
        else:
            coach_compliant = Class.objects.filter(coach__contains=coach)
            for cls in coach_compliant:
                coach_compliant_set.add(cls.studio.id)

        all_compliant_set = studio_name_compliant_set.intersection(amenity_compliant_set, class_name_compliant_set, coach_compliant_set)
        for studio_id in all_compliant_set:
            compliant_studio = Studio.objects.get(id=studio_id)
            studio_list.append({
                "id": compliant_studio.id,
                "name": compliant_studio.name,
                "address": compliant_studio.address,
                "postal_code": compliant_studio.postal_code,
                "phone_number": compliant_studio.phone_number,
                "main_image": compliant_studio.main_image.url,
            })

        # pagination: return 9 entries per page
        p = Paginator(studio_list, 9)
        studio_list_paged = None
        try:
            studio_list_paged = p.page(int(page_num))
            studio_list_paged_serializable = []
            for studio in studio_list_paged:
                studio_list_paged_serializable.append(studio)
            return JsonResponse(studio_list_paged_serializable, safe=False)
        except EmptyPage:
            return JsonResponse([], safe=False)

class ClassSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        studio_id = kwargs['studio_id']
        class_name = request.GET.get('class_name')
        coach = request.GET.get('coach')
        date_string = request.GET.get('date')
        start_time_string = request.GET.get('start_time')
        end_time_string = request.GET.get('end_time')
        page_num = int(request.GET.get('page'))

        errors = []
        date, start_time, end_time = None, None, None
        if date_string is not None:
            try:
                date = datetime.fromisoformat(date_string).date()
            except ValueError:
                errors.append({'date': 'Not a valid date format.'})

        
        if start_time_string is not None:
            start_time_b = False
            try:
                start_time = int(start_time_string)
            except ValueError:
                errors.append({'start_time': 'Not a valid time format.'})
                start_time_b = True
            if not start_time_b and (start_time < 0 or start_time > 23):
                errors.append({'start_time': 'Start time must be in between 0-23'})
                
        if end_time_string is not None:
            end_time_b = False
            try:
                end_time = int(end_time_string)
            except ValueError:
                errors.append({'end_time': 'Not a valid time format.'})
                end_time_b = True
            if not end_time_b and (end_time < 0 or end_time > 23):
                errors.append({'end_time': 'End time must be in between 0-23'})

        if errors:
            raise ValidationError(errors)
        # all classes in that studio
        studio_compliant = Class.objects.filter(studio=studio_id)
        studio_compliant_set = set()
        for cls in studio_compliant:
            studio_compliant_set.add(cls.id)

        class_name_compliant_set = set()
        if class_name is None:
            for class_id in studio_compliant_set:
                class_name_compliant_set.add(class_id)
        else:
            class_name_compliant = Class.objects.filter(name__contains=class_name)
            for cls in class_name_compliant:
                class_name_compliant_set.add(cls.id)

        coach_compliant_set = set()
        if coach is None:
            for class_id in studio_compliant_set:
                coach_compliant_set.add(class_id)
        else:
            coach_compliant = Class.objects.filter(coach__contains=coach)
            for cls in coach_compliant:
                coach_compliant_set.add(cls.id)

        # all class ids that satisfy studio_id, class_name, and coach
        compliant_class_ids = studio_compliant_set.intersection(class_name_compliant_set, coach_compliant_set)

        all_cls_instances = ClassInstance.objects.filter(start_datetime__gte=datetime.now())

        date_compliant_set = set()
        if date is None:
            for cls_instance in all_cls_instances:
                if cls_instance.cls.id in compliant_class_ids:
                    date_compliant_set.add(cls_instance.id)
        else:
            for cls_instance in all_cls_instances:
                if cls_instance.cls.id in compliant_class_ids and cls_instance.start_datetime.date() == date:
                    date_compliant_set.add(cls_instance.id)

        start_time_compliant_set = set()
        if start_time is None:
            for cls_instance in all_cls_instances:
                if cls_instance.cls.id in compliant_class_ids:
                    start_time_compliant_set.add(cls_instance.id)
        else:
            for cls_instance in all_cls_instances:
                if cls_instance.cls.id in compliant_class_ids and cls_instance.start_datetime.hour >= start_time:
                    start_time_compliant_set.add(cls_instance.id)

        end_time_compliant_set = set()
        if end_time is None:
            for cls_instance in all_cls_instances:
                if cls_instance.cls.id in compliant_class_ids:
                    end_time_compliant_set.add(cls_instance.id)
        else:
            for cls_instance in all_cls_instances:
                if cls_instance.cls.id in compliant_class_ids and cls_instance.end_datetime.hour <= end_time:
                    end_time_compliant_set.add(cls_instance.id)

        # finally all compliant class instance ids (not necessarily sorted)
        compliant_class_instance_ids = date_compliant_set.intersection(start_time_compliant_set, end_time_compliant_set)

        cls_instance_list = []
        for cls_instance_id in compliant_class_instance_ids:
            compliant_class_instance = ClassInstance.objects.get(id=cls_instance_id)
            cls = Class.objects.get(id=compliant_class_instance.cls.id)

            # whether user is enrolled in this class instance
            user = UserProfile.objects.get(user=request.user)
            get_object_or_404(UserProfile, id=user.id)
            enrolled = None
            try:
                Enrollment.objects.get(user=user, cls_instance=compliant_class_instance)
                enrolled = True
            except ObjectDoesNotExist:
                enrolled = False

            cls_instance_list.append({
                "id": cls_instance_id,
                "enrolled": enrolled,
                "start_datetime": compliant_class_instance.start_datetime,
                "end_datetime": compliant_class_instance.end_datetime,
                "cancelled": compliant_class_instance.cancelled,
                "num_enrolled": compliant_class_instance.num_enrolled,
                "class": {
                    "id": cls.id,
                    "name": cls.name,
                    "description": cls.description,
                    "coach": cls.coach,
                    "capacity": cls.capacity,
                },
            })
        cls_instance_list.sort(key=lambda x: x["start_datetime"])

        # pagination: return 5 entries per page
        p = Paginator(cls_instance_list, 5)
        cls_instance_list_paged = None
        try:
            cls_instance_list_paged = p.page(int(page_num))
            cls_instance_list_paged_serializable = []
            for ci in cls_instance_list_paged:
                cls_instance_list_paged_serializable.append(ci)
            return JsonResponse(cls_instance_list_paged_serializable, safe=False)
        except EmptyPage:
            return JsonResponse([], safe=False)

class ClassScheduleView(APIView, CustomNumberPagination):
    # see the class schedule of a studio in order of start time
    permission_classes = [IsAuthenticated]
    pagination_class = CustomNumberPagination

    def get(self, request, *args, **kwargs):
        studio_id = kwargs['studio_id']

        # need the classes that map to this studio
        classes = Class.objects.all().select_related().filter(studio = studio_id)

        if (not Studio.objects.filter(id=studio_id).exists()):
            return HttpResponseNotFound(json.dumps({'response': 'Not found.'}), content_type='application/json')

        # need the class instances for this particular class
        qs = ClassInstance.objects.none()

        for cl in classes:
            qs = qs | ClassInstance.objects.all().select_related().filter(cls = cl.id).filter(cancelled = False).filter(start_datetime__range = [datetime.now(), date.max])

        # now we have the scheduled classes for every class in a given studio

        qs = qs.order_by('start_datetime__year', 'start_datetime__month', 'start_datetime__day', 'start_datetime__hour', 'start_datetime__minute', 'start_datetime__second')
        compliant_class_instance_ids = []
        for ci in qs:
            compliant_class_instance_ids.append(ci.id)

        cls_instance_list = []
        for cls_instance_id in compliant_class_instance_ids:
            compliant_class_instance = ClassInstance.objects.get(id=cls_instance_id)
            cls = Class.objects.get(id=compliant_class_instance.cls.id)

            # whether user is enrolled in this class instance
            user = UserProfile.objects.get(user=request.user)
            get_object_or_404(UserProfile, id=user.id)
            enrolled = None
            try:
                Enrollment.objects.get(user=user, cls_instance=compliant_class_instance)
                enrolled = True
            except ObjectDoesNotExist:
                enrolled = False

            cls_instance_list.append({
                "id": cls_instance_id,
                "enrolled": enrolled,
                "start_datetime": compliant_class_instance.start_datetime,
                "end_datetime": compliant_class_instance.end_datetime,
                "cancelled": compliant_class_instance.cancelled,
                "num_enrolled": compliant_class_instance.num_enrolled,
                "class": {
                    "id": cls.id,
                    "name": cls.name,
                    "description": cls.description,
                    "coach": cls.coach,
                    "capacity": cls.capacity,
                },
            })
        cls_instance_list.sort(key=lambda x: x["start_datetime"])

        # pagination: return 5 entries per page
        p = Paginator(cls_instance_list, 5)
        cls_instance_list_paged = None
        page_num = int(request.GET.get('page'))
        try:
            cls_instance_list_paged = p.page(int(page_num))
            cls_instance_list_paged_serializable = []
            for ci in cls_instance_list_paged:
                cls_instance_list_paged_serializable.append(ci)
            return JsonResponse(cls_instance_list_paged_serializable, safe=False)
        except EmptyPage:
            return JsonResponse([], safe=False)


class PostalCodeConverter(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        postal_code = request.GET.get("postal_code")
        if postal_code:
            nomi = pgeocode.Nominatim('ca')
            data = nomi.query_postal_code(postal_code)
            return JsonResponse({'latitude': data.latitude, 'longitude': data.longitude}, safe=False)
        else:
            return HttpResponseNotFound(json.dumps({'response': 'Not found.'}), content_type='application/json')

class StudioIdToName(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        studio_id = kwargs['studio_id']
        studio = Studio.objects.all().filter(id = studio_id)[0]
        return JsonResponse({'studio_name': studio.name}, safe=False)