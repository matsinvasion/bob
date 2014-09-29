//helper function to get item in a list


//list controller to create lists
//Controller to create list items
populate_list_scope_values = function ($scope,Restangular) {
  //EndPoint expects JSON
  list = JSON.stringify($scope.listobject);
  req_object = list;
  //create our items at this point
    return req_object;
}
//create list resource
createListResource = function ($scope, Restangular) {
  //list name
  var post_data = populate_list_scope_values($scope,Restangular)

    // Create our list
  return  Restangular.all('orderlist/').post(post_data)

}

//define list controller
var listResourceController = angular.module('listResourceController',[]);

listResourceController.controller('listCtrl',['$scope','utils','$stateParams','Restangular','$q',function($scope,utils,$stateParams,Restangular){
  //avail our scope in browser console
  window.listResource_SCOPE = $scope;

  //GET current user
  //this is prbably wrong
  user_object = Restangular.all('user').getList().then(function(users){
    $scope.user=users[0].resource_uri;
    $scope.user_name=users[0].username;
    //GET lists created by the user
    //Restangular objects are self aware and can make know how to make their own requests
    //$object enables use these lists in template

    orderList_object = Restangular.all('orderlist/?user__username='+$scope.user_name+'&format=json&is_active=true');
    $scope.lists = orderList_object.getList().$object;



    //how many lists does user own
    $scope.num_of_lists = function(){
      return $scope.lists.length;
    }

    $scope.current_list=utils.getList($scope.lists,$stateParams.id);
    });

  $scope.listobject = {};
  $scope.createlist=function(isValid){
    if(isValid){
      //object expected by resource
      $scope.listobject = {title:$scope.list_name,scheduled_time:$scope.scheduledTime,created_by:$scope.user,modified_by:$scope.user,user:$scope.user}
      $scope.submitted = true;

      post_update_data = createListResource($scope,Restangular).then(
                        function () {

                            // success!
                            //initialize list name field
                            $scope.list_name = '';
                            $scope.lists.unshift($scope.listobject);
                        },

                        function (){
                            // error!

                        }

                     )

    }
  }
  //delete a list from user view
  //make is_active=false in database instead of complete removal
  //use Array.Splice to remove a particular item from array
  //also ng-repeate gives us access to special $index property
  //which is current index of array passed in
  $scope.delete = function(idx){
    //list to delete
    var list_to_delete = $scope.lists[idx];
    //update to make on data
    var inactivate = {is_active:false}
    var patch_update_data = JSON.stringify(inactivate)
    //update list
    Restangular.all('orderlist/'+list_to_delete.id+'/').patch(patch_update_data)
    .then(function(){
      //success
      //remove list from view
      $scope.lists.splice(idx,1);

    }),function(){
      //error
      alert("Jeez that didn't go well.Give us a moment to fix it.")
    }
  }
}]).directive('datetimepicker',function(){
  return {
    require: "?ngModel",
    restrict: "AE",
    link: function(scope,elm,attr,ngModel){
      $(elm).datetimepicker({});
      $(elm).on('blur',function(value){
        //set scheduledTime model value
        scope.$apply(function(){ngModel.$setViewValue($(elm).datetimepicker().val());
        });
      });
    }
  };
});



//Controller to create list items
populate_scope_values = function ($scope,Restangular) {
  //EndPoint expects JSON
  order_items = JSON.stringify($scope.order_items);
  req_object = '{"objects":'+order_items+'}';
  //create our items at this point
    return req_object;
}
// items request resource
create_itemresource = function ($scope, Restangular) {
  //collection of items | authenicated too
  var post_data = populate_scope_values($scope,Restangular)

    // Create our item
  return  Restangular.all('list_item/').patch(post_data)

}

var itemResourceController = angular.module('itemResourceController',[])

itemResourceController.controller('itemCtrl',['$scope','Restangular','$q',function($scope,Restangular,$q){
  //avail our scope in browser console
  window.itemResource_SCOPE = $scope;
  //GET current user
  //what happens when we have 1,000,000 users
  user_object = Restangular.all('user');
  //chances are this is the wrong user
  user_object.getList().then(function(users){ $scope.user=users[0].resource_uri});
  //GET current users available lists.

  //list of order item objects
  $scope.order_items = [];
  $scope.random_number = Math.floor(Math.random()*255);
  $scope.addItem= function(isValid){

    if(isValid){
      console.log("Random integer is "+ $scope.random_number)

      //build our order item with required units
      $scope.order_items.unshift({item_description:$scope.item_description,note:$scope.note,
        created_by:$scope.user,modified_by:$scope.user,item_stamp:$scope.random_number});
      $scope.submitted = true;
    }

    //initialize our item text field
    $scope.item_description = '';
    $scope.note = '';

    $scope.call_func = function(){
      post_update_data = create_itemresource($scope,Restangular).then(
                        function () {

                            // success!
                        },

                        function (){
                            // error!

                        }

                     )


    }
    //delete item from view,no effect on database
    $scope.delete = function(idx){
      return $scope.order_items.splice(idx,1);
    }


    //number of items in order
  }
  $scope.num_of_items = function(){
    return $scope.order_items.length;
  }
}]);
