from django.conf.urls import patterns, include,url
from .views import *

urlpatterns = OrderListCRUDL().as_urlpatterns()
