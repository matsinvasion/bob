from tastypie.resources import ModelResource,ALL,ALL_WITH_RELATIONS
from items.models import Item
from orders.models import OrderList,Order,Assignment
from tastypie import fields
from tastypie.authorization import Authorization, DjangoAuthorization
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from tastypie.http import HttpUnauthorized, HttpForbidden
from django.conf.urls import url
from tastypie.utils import trailing_slash
import datetime
from django.db import models
from registration.models import RegistrationProfile
from registration import signals
from django.contrib.sites.models import Site, RequestSite
from tastypie.cache import SimpleCache



#Our resources

class UserResource(ModelResource):
  """GET and UPDATE User"""
  class Meta:
    queryset = User.objects.all()
    resource_name = "user"
    authorization = Authorization()
    excludes = ['is_active','is_staff','is_superuser','date_joined','last_login']
    always_return_data =True
    filtering={
              'username':ALL,
              'id':ALL,
    }
    cache = SimpleCache(timeout=10);

  #provide login urls

  def override_urls(self):
    return [
    url(r"^(?P<resource_name>%s)/login%s$" %(self._meta.resource_name, trailing_slash()),self.wrap_view('login'), name="api_login"),
    url(r'^(?P<resource_name>%s)/logout%s$' %(self._meta.resource_name, trailing_slash()),self.wrap_view('logout'), name='api_logout'),
    ]

  #provide login functionality
  def login(self,request,**kwargs):
    self.method_check(request, allowed=['post'])
    data = self.deserialize(request, request.body, format=request.META.get('CONTENT_TYPE', 'application/json'))
    username = data.get('username', '')
    password = data.get('password', '')

    user = authenticate(username=username,password=password)
    if user:
      if user.is_active:
        login(request,user)
        return self.create_response(request, {'success': True})
      else:
        return self.create_response(request, {
                    'success': False,
                    'reason': 'disabled',
                    }, HttpForbidden )
    else:
      return self.create_response(request, {
                'success': False,
                'reason': 'incorrect',
                }, HttpUnauthorized )

  def logout(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        if request.user and request.user.is_authenticated():
            logout(request)
            return self.create_response(request, { 'success': True })
        else:
            return self.create_response(request, { 'success': False }, HttpUnauthorized)









  #django-registration does the registering | consistency
  @staticmethod
  def user_registration(request,username,email,password,site):
    #use static method since we don't need an instance
    #without it we get a type error.
    new_user = RegistrationProfile.objects.create_inactive_user(username,email,
    password,site,send_email=True,request=request)

    return new_user


  #customize input
#  def hydrate(self,bundle):

#    return bundle

  def obj_create(self,bundle,**kwargs):
    #create inactive user and send email
    #have Django registration do this for us
    request = bundle.request
    raw_password,email= bundle.data["password"],bundle.data["email"]
    username=bundle.data["email"]
    if Site._meta.installed:
      site = Site.objects.get_current()
    else:
      site = RequestSite(bundle.request)
    new_user=self.user_registration(request,username,email,raw_password,site)
    signals.user_registered.send(sender=self.__class__,
                                        user=new_user,
                                        request=bundle.request)
    return bundle



  #return response with current user object
  #used by to create lists with angularjs
  def authorized_read_list(self,object_list,bundle):
    current_user = object_list.filter(id=bundle.request.user.id)
    return current_user
#curl -v -X POST -d '{"email":"gwen@gmail.com","username":"gwen","password":"model"}' -H "Content-Type:application/json" http://127.0.0.1:8000/api/v1/user/



#curl -v -X POST -d '{"email":"gwen@gmail.com","username":"gwen","password":"model"}' -H "Content-Type:application/json" http://127.0.0.1:8000/api/v1/user/



class OrderResource(ModelResource):
  #since tastypie has no way to render relationships,use UserResource

  created_by =fields.ToOneField(UserResource,'created_by',null=True,blank=True)
  modified_by = fields.ToOneField(UserResource,'modified_by',null=True,blank=True)

  class Meta:
    queryset = Order.objects.all()
    resource_name = 'order'
    authorization =Authorization()
    always_return_data = True
    cache=SimpleCache(timeout=10)
    #we can do some filtering on this resource





class OrderListResource(ModelResource):
  #since tastypie has no way to render relationships,use UserResource
  #we need a User field so we can be able to query the lists created by a user
  user = fields.ToOneField(UserResource,'user',null=True,blank=True,full=True)
  item = fields.ToManyField('public.api.ItemResource','item_set',full=True,null=True,blank=True)
  order = fields.ToOneField(OrderResource,'order',null=True,blank=True,full=True)
  created_by = fields.ToOneField(UserResource,'created_by',null=True,blank=True)
  modified_by = fields.ToOneField(UserResource,'modified_by',null=True,blank=True)
  class Meta:
    queryset = OrderList.objects.all().order_by('-created_on')
    resource_name ="orderlist"
    authorization = Authorization()
    always_return_data = True
    filtering={
              'user':ALL_WITH_RELATIONS,
              'is_active':ALL,
    }
    limit =0
    cache=SimpleCache(timeout=10)

  #avail a created list to session
  #operations after this assume
  #user will keep editing this list
  def dehydrate(self,bundle):
    bundle.request.session["current_list_title"] = bundle.data["title"]
    #always returns a bundle
    return bundle


class ItemResource(ModelResource):

  orderlist = fields.ToOneField(OrderListResource,'orderlist',null=True,blank=True)
  created_by = fields.ToOneField(UserResource,'created_by',null=True,blank=True)
  modified_by = fields.ToOneField(UserResource,'modified_by',null=True,blank=True)

  class Meta:
    queryset = Item.objects.all()
    resource_name = 'list_item'
    authorization = Authorization()
    always_return_data = True
    cache=SimpleCache(timeout=10)

  def dehydrate(self,bundle):
    bundle.request.session["item_stamp"] = bundle.data["item_stamp"]
    return bundle


class AssignmentResource(ModelResource):
  #define these fields on resource,
  #cannot make request without them since, tastypie doesnot know them beforehand
  created_by = fields.ToOneField(UserResource,'created_by',null=True,blank=True)
  modified_by = fields.ToOneField(UserResource,'modified_by',null=True,blank=True)
  orderlist = fields.ToOneField(OrderListResource,'orderlist',null=True,blank=True,full=True)
  class Meta:
    queryset = Assignment.objects.all()
    resource_name = 'assignments'
    authorization = Authorization()
    always_return_data =True
