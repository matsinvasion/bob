from django.shortcuts import render_to_response, render
from django.template import RequestContext
from items import forms
from django.http import HttpResponseRedirect, Http404
from django.core.urlresolvers import reverse
from items.models import Item
from orders.models import Order, OrderList
import datetime
from django.contrib.auth.models import User
from .forms import ContactUs
from django.core.mail import send_mail

#home
def inbox(request):
  return render_to_response('public/index.html',context_instance=RequestContext(request))

#landing page
def landing(request):

  if request.user.is_authenticated() and not request.is_superuser():

    email = request.user.username
    position = email.index('@')
    username= email[0:position]
  else:
    username=''

  context = {'username':username}
  return render_to_response('public/landing.html',context,context_instance = RequestContext(request))

def contact_us(request):

  username = ""

  if request.user.is_authenticated() and not request.is_superuser():

    email = request.user.username
    position = email.index('@')
    username= email[0:position]

  if request.method == "POST":
    #bind form
    form = ContactUs(request.POST)
    #validate form
    if form.is_valid():
      #get required information
      name = form.cleaned_data["name"]
      email = form.cleaned_data["email"]
      message = form.cleaned_data["message"]
      recipients = ["markshelprwanda@gmail.com,markmusasizi@gmail.com"]
      email_subject = "Incoming Inquiry %s"% name
      #send mail
      send_mail(email_subject,message + '\n \nFrom ' + name + '\nReply to ' + email,email, recipients)
      # succes redirect
      return render_to_response('public/contact_success.html',context_instance=RequestContext(request))
  else:
    #unbound form

    form = ContactUs()
    return render(request,'public/contact.html',{'form':form,'username':username})
