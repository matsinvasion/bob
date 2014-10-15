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
    fields = ('title','user','order.address','ListItems','order.mobile','order.address','order.comment')

    def get_listItems(self,obj):
      #make sure to return items that belong only to this user
      collection = obj.item_set.all()
      items_in_list=[]
      for i in collection:
        items_in_list.append(i.item_description)
      return items_in_list

class AssignmentCRUDL(SmartCRUDL):
  model = Assignment
  actions = ("list",'read','update')
  permissions = True

  class List(SmartListView):
    fields = ('date','orderlist.user','orderlist.title')

    #order assignments by date created
    def get_queryset(self,*args,**kwargs):
      queryset = super(AssignmentCRUDL.List,self).get_queryset(*args,**kwargs)
      #later on when we individuals to take up assignments
      #configure that here
      return queryset.order_by('-created_on')

  class Read(SmartReadView):
    fields = ('date','orderlist.user.username','orderlist.title','orderlist.scheduled_time',
    'listItems','orderlist.order.address','orderlist.order.mobile','orderlist.order.comment')

    def get_listItems(self,obj):
      items = obj.orderlist.item_set.all()
      assigned_items =[]
      for item in items:
        assigned_items.append(item.item_description.__str__())
      return assigned_items
