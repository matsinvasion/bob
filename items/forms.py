from .models import Item
from django import forms

from orders.models import Order, OrderList

# order form for our user
class CheckoutForm(forms.ModelForm):
  class Meta:
    model = Order
    exclude = ('created_by','modified_by','recruited_at','confirmed_at',
                                                          'enroute_at',
                                                          'paid_at',
                                                          'cancelled_at',
                                                          'delivered_at',
                                                          'stage',
                                                          'user',
                                                          'started_at'

    )


#Create List form
class CreateList(forms.ModelForm):
  class Meta:
    model = OrderList
    exclude = ('created_by','modified_by','user','item','order')

class OrderForm(forms.ModelForm):
  class Meta:
    model = Item
    exclude =('created_by','modified_by','is_active','time_stamp','orderlist')
