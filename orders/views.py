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

    def get_context_data(self,*args,**kwargs):
    #  import pdb;pdb.set_trace()
      context = super(AssignmentCRUDL.Read, self).get_context_data(*args,**kwargs)
      #Avail Lists
      list_info = context["assignment"].orderlist
      context["list_info"]=list_info

      #Avail items as tasks
      tasks = context["assignment"].orderlist.item_set.all()
      context["tasks"]=tasks

      #Avail order object
      task_info = context["assignment"].orderlist.order
      context["task_info"] = task_info

      #Avail user
      user_info = context["assignment"].orderlist.user
      context["user_info"] = user_info

      return context



    def get_list_Items(self,obj):
      items = obj.orderlist.item_set.all()
      assigned_items =[]
      for item in items:
        assigned_items.append(item.item_description.__str__())
      return assigned_items
