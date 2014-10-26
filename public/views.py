from django.shortcuts import render_to_response, render
from django.template import RequestContext
from items import forms
from django.http import HttpResponseRedirect, Http404
from django.core.urlresolvers import reverse
from items.models import Item
from orders.models import Order, OrderList
import datetime
from django.contrib.auth.models import User

#home
def home(request):
  return render_to_response('public/index.html',context_instance=RequestContext(request))

#landing page
def landing(request):

  form = forms.OrderForm
  createList= forms.CreateList

  context = {'form': form,'listform':createList}
  return render_to_response('public/landing.html',context,context_instance = RequestContext(request))
