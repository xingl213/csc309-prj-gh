from django.urls import path

from studios.views import ClassSearchView, ClosestStudioView, StudioSearchView, \
    StudioInfoView, ClassScheduleView, StudioAmenitiesView, StudioImagesView, PostalCodeConverter, StudioIdToName

app_name = 'studios'

urlpatterns = [
    path(r'search', StudioSearchView.as_view()),
    path(r'<int:studio_id>/search', ClassSearchView.as_view()),
    path('<int:studio_id>/info/', StudioInfoView.as_view()),
    path('api/closest_studio/', ClosestStudioView.as_view()),
    path('<int:studio_id>/classes/schedule/', ClassScheduleView.as_view()),
    path('<int:studio_id>/amenities/', StudioAmenitiesView.as_view()),
    path('<int:studio_id>/images/', StudioImagesView.as_view()),
    path('postal_converter/', PostalCodeConverter.as_view()),
    path('<int:studio_id>/id_to_name/', StudioIdToName.as_view())
]
