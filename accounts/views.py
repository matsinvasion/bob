from django.shortcuts import render
from registration.backends.default.views import RegistrationView
from registration.models import RegistrationProfile
from django.conf import settings
from django.contrib.sites.models import RequestSite
from django.contrib.sites.models import Site
from registration import signals

# Create your views here.

class UserRegistration(RegistrationView):

  #override registration method on Registrationview
  # send email

  SEND_ACTIVATION_EMAIL = getattr(settings,'SEND_ACTIVATION_EMAIL',True)

  def register(self,request,**cleaned_data):
    #override this function
    #make email username
    username,email,password = cleaned_data["email"],cleaned_data["email"],cleaned_data["password1"]
    if Site._meta.installed:
      site = Site.objects.get_current()

    else:
      site = RequestSite(request)

    #register user
    new_user = RegistrationProfile.objects.create_inactive_user(username,
    email,password,site,send_email = self.SEND_ACTIVATION_EMAIL,request=request)

    #notify who ever it concerns
    signals.user_registered.send(sender=self.__class__,user=new_user,request=request)

    return new_user
