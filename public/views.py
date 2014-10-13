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
# Create your views here.
#get_list, bind it to items
def get_or_create_list(request):
  #get item identifier
  stamp = request.session["item_stamp"]
  #get current user
  session_user = request.session["_auth_user_id"]
  #get current list being edited or created by user
  current_list_title = request.session["current_list_title"]
  #user must be of instance of User object
  user = User.objects.get(pk=session_user)
  #items must be instances of Item object
  list_items = Item.objects.filter(item_stamp=stamp)
  #get or create our current list
  #no lists should have the same title
  orderlist,created=OrderList.objects.get_or_create(title=current_list_title)
  for item in list_items:
    orderlist.item_set.add(item)
  return orderlist

def create_order(request,orderlist):
    #its a new order, create it
    order_creator = User.objects.get(pk=request.session["_auth_user_id"])
    postdata = request.POST.copy()
    order = Order.objects.create(created_by=order_creator,modified_by=order_creator,
                                                  stage = 's',
                                                  started_at = datetime.datetime.now(),
                                                  address = postdata["address"],
                                                  comment = postdata["comment"],

    )
    #bind this order to the orderlist
    order.order_lists.add(orderlist)
    order.save()
    #set order id
    #request.session["order_id"] = order.id
    return order
def order_confirmation(request):
  return render_to_response('public/order_confirmation.html',context_instance=RequestContext(request))

def checkout(request):
  """create Order and OrderList once we have all we need from customer"""
  form = forms.CheckoutForm
  if request.method=="POST":

    #bound our form
    form = forms.CheckoutForm(request.POST)
    if form.is_valid():
      orderlist = get_or_create_list(request)
      order = create_order(request,orderlist)
      #create our order list,
      #since order is a list of orders, loop through it
      import pdb;pdb.set_trace()


      return HttpResponseRedirect(reverse('confirmation'))
    else:
      raise Http404


  context = {'form':form}

  return render_to_response('public/checkout.html',context,context_instance=RequestContext(request))

#landing page
def landing(request):

  form = forms.OrderForm
  createList= forms.CreateList

  context = {'form': form,'listform':createList}
  return render_to_response('public/landing.html',context,context_instance = RequestContext(request))
