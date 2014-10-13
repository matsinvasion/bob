
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
