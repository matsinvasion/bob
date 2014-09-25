from django.db import models
from smartmin.models import SmartModel
from django.contrib.auth.models import User
from django.conf import settings
import datetime
from decimal import Decimal
from customers.models import Location



class Order(SmartModel):

  """Clarifies all that makes up an order"""
  ORDER_STAGES = (('S', "Started"), # started placing items in this order
                    ('L', "Located"), # the user has finalized their order and located themselves
                    ('P', "Paid"), # order is placed and paid for
                    ('C', "Confirmed"), # order is confirmed by restaurant
                    ('R', "Recruited"), # a moto has been recruited to deliver this order
                    ('E', "En Route"), # the order is on its way to the customer
                    ('D', "Delivered"), # the order has been delivered
                    ('X', "Cancelled")) # the order was cancelled

  user = models.ForeignKey(User, null=True,
                             help_text="The customer that owns this order, can be null")
  address = models.CharField(max_length=140,
                                 help_text="Where should we deliver, 140 characters.")
  stage = models.CharField(max_length=1, default='S',
                             help_text="The state of this order")

  comment = models.TextField(max_length=140, help_text="Anything else, in 140 characters.")

  started_at = models.DateTimeField(null=True,
                                      help_text="When the order was first started")
  paid_at = models.DateTimeField(null=True,
                                   help_text="When the order was paid for")
  confirmed_at = models.DateTimeField(null=True,
                                       help_text="When the order was confirmed by freshbunch stuff")
  recruited_at = models.DateTimeField(null=True,
                                        help_text="When del_ind was recruited to deliver this order")
  enroute_at = models.DateTimeField(null=True,
                                      help_text="When del_individual picked up the order at the market")
  delivered_at = models.DateTimeField(null=True,
                                        help_text="When the order was delivered")
  cancelled_at = models.DateTimeField(null=True,
                                        help_text="When the order was cancelled")

  #def add_to_list(self,order):
    #add this order to its specific list
  #  self.order_lists.add(order)
  #  return self.order_lists

class OrderList(SmartModel):
  """Collection of order items"""
  user = models.ForeignKey(User,null=True)
  order = models.ForeignKey(Order,null=True,blank=True,related_name="order_lists",help_text="when created.")
  title=models.CharField(max_length=60,help_text="List name.")
  scheduled_time = models.CharField(max_length=100,null=True,blank=True,help_text="When work should be done.")
