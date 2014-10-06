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
#    import pdb;pdb.set_trace()
    fields = ('scheduled_time','title','user','order.mobile','order.address','order.comment')

  class Read(SmartReadView):
    fields = ('title','user','order.address','listItems','order.mobile','order.address','order.comment')

    def get_listItems(self,obj):
      #make sure to return items that belong only to this user
      collection = obj.item_set.all()
      items_in_list=[]
      for i in collection:
        items_in_list.append(i.item_description)
      return items_in_list
