from django.conf.urls import patterns, include, url
import settings
from tastypie.api import Api
from public.api import *
from public.views import home


#configure url hooks for our Apis.

v1_api = Api(api_name='v1')
# register several apis

v1_api.register(UserResource())
v1_api.register(ItemResource())
v1_api.register(OrderListResource())
v1_api.register(OrderResource())
#v1_api.register(CreateUserResource())





# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()


urlpatterns = patterns('',

    url(r'^$',home,name="homepage"),
    url(r'^orders/', include('public.urls')),
    url(r'^api/', include(v1_api.urls)),
    #user default registration backend urlconf with django-registration
    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'^users/', include('smartmin.users.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
# Static file patterns
urlpatterns += patterns('',
	url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
	url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),

)
