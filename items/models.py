from django.db import models
from smartmin.models import SmartModel
from django.contrib.auth.models import User
import datetime
import random
from orders.models import OrderList
from django import forms

# Create your models here.

class Item(SmartModel):
  """Item ordered"""
  UNITS = (("Kilogram","Kg"),("Litre",("Ltr")))

  item_description = models.CharField(max_length=140,null=False,blank=False,help_text="Add item e.g Frozen Yogurt")
  note = models.TextField(max_length=140,blank=True,null=True,help_text="Add a note.")
  item_stamp = models.CharField(max_length=60,blank=False,null=False,help_text="identifies item as created in a session")
  orderlist = models.ForeignKey(OrderList,null=True,blank=True)
