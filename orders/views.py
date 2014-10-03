# Create your views here.
#Views used by order administrators

from smartmin.views import *
from .models  import *

class OrderListCRUDL(SmartCRUDL):
  model = OrderList
  actions = ("list","read",'update')
  permissions = True

  #override list objec
  class List(SmartListView):
    fields = ('scheduled_time','title','user','order.mobile','order.address','order.comment')

  class Read(SmartReadView):
    fields = ('title','user','order.address','order.mobile','order.address','order.comment')
