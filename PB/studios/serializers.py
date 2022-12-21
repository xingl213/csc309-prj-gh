from rest_framework.serializers import ModelSerializer
from .models import ClassInstance, Class, Studio, Amenity, Base64Image

class ClassSerializer(ModelSerializer):

    class Meta:
        model = Class
        fields = ['name', 'description', 'coach', 'capacity', 'id']

class ClassInstanceSerializer(ModelSerializer):
    cls = ClassSerializer()

    class Meta:
        model = ClassInstance
        fields = ['id', 'start_datetime', 'end_datetime', 'num_enrolled', 'cls']

class StudioSerializer(ModelSerializer):

    class Meta:
        model = Studio
        fields = ['name', 'address', 'postal_code', 'latitude', 'longitude', 'phone_number', 'distance', 'id']

class AmenitySerializer(ModelSerializer):

    class Meta:
        model = Amenity
        fields = ['type', 'numbers', 'access_level']

class B64Serializer(ModelSerializer):

    class Meta:
        model = Base64Image
        fields = ['image_b64', 'studio']
