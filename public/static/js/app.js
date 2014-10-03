//declare app level module that depends on services,controllers
//register e on module loading alternative symbols for our django environment
app = angular.module('GroceryList',['restangular','xeditable','ui.bootstrap','ui.router','itemResourceController','listResourceController']).
  config(function($interpolateProvider,$httpProvider,RestangularProvider){
    $httpProvider.defaults.xsrfCookieName= 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName='X-CSRFToken';
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
    //base url for our api calls
    RestangularProvider.setBaseUrl('api/v1');
    //response on call
    //extract array from response incase of getList()
    RestangularProvider.addResponseInterceptor(function(data,operation,what,url,response,defeered){
      var extractedData;
      //... to look for getlist operations
      if(operation === 'getList'){

        //handle data and meta data
        extractedData = data.objects;
      //  extractedData.meta = data.data.meta;
      }else{
        extractedData = data;
      }
      return extractedData;
    });

  })
//register a utility function to angular module
app.factory('utils',function(){
  return {
    getList: function (target,id){
      for(var i=0;i<target.length;i++){
        if(target[i].id == id) return target[i];
      }
      return null;
}
}
});
//list creation helper functions

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


//item creation helper functions
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
    //here we create an item through a list.
  return  Restangular.all('orderlist/').post(post_data)

}
app.run(function(editableOptions){
  editableOptions.theme='bs3';
})
app.controller('assigntask',['$scope','Restangular','$state','$stateParams',function($scope,Restangular,$state,$stateParams){

  $scope.assign=function(){
  user_object = Restangular.all('user').getList().then(function(user){
    user_uri=user[0].resource_uri;

    //order objnect
    order_object = {address:$scope.address,mobile:$scope.mobile,
    comment:$scope.comment,created_by:user_uri,modified_by:user_uri};
    patch_object=JSON.stringify({order:order_object});

    //update list to add order
    Restangular.all('orderlist/'+$stateParams.id+'/').patch(patch_object).then(function(){
      //dismiss modal
      $scope.dismiss();
      //transition to confirmation
      $state.transitionTo('lists.confirmation',{
        reload:true
      })
    })//orderlist promise ends here


  })//user promise ends here



  }
  //on canceling moda
  $scope.dismiss=function(){
    $scope.$dismiss();
  }

}])
app.controller('edit',['$scope','$state','$stateParams','Restangular',function($scope,$state,$stateParams,Restangular){
  $scope.editList=function(id){
    //edit, endpoint expects json

    var edit={title:$scope.new_name,scheduled_time:$scope.scheduledTime};
    var patch_data = JSON.stringify(edit);
    console.log("patch data is "+patch_data)

    //make call
    Restangular.all('orderlist/'+id+'/').patch(patch_data).then(function(){
      //success
      //close and reload parent state

      $scope.dismiss('saved');
      $state.transitionTo("lists.list",$stateParams,{
      reload:true
      })
    },
    //error
    function(){
      alert("jeeze something went wrong, could try that again please?");
    }
    )


  }
}])

app.controller('createlist',['$scope','$stateParams','$state','Restangular',
function($scope,$stateparams,$state,Restangular){

  //GET current user
  //this is prbably wrong
  user_object = Restangular.all('user').getList().then(function(users){
    $scope.user=users[0].resource_uri;
    $scope.user_name=users[0].username;
    //GET lists created by the user
    //Restangular objects are self aware and can make know how to make their own requests
    //$object enables use these lists in template

  orderList_object = Restangular.all('orderlist/?user__username='+$scope.user_name+'&format=json&is_active=true');
})
  //create list
  $scope.dismiss = function(){
    $scope.$dismiss('dismmised')
    //will redirect to the home list
    $state.transitionTo('lists.list',$stateparams,{
      //force transition default:false
      reload:true,
      //broadcast $stateChangeStart and $stateChangesuccess event default:false
      notify:true,
      //inherit url paramtere from current url
      inherit:false
    })
  }
  $scope.listobject = {};
  $scope.createlist=function(isValid){
    if(isValid){
      //object expected by resource
      $scope.listobject = {title:$scope.list_name,scheduled_time:$scope.scheduledTime,created_by:$scope.user,modified_by:$scope.user,user:$scope.user};
      $scope.submitted = true;

      createListResource($scope,Restangular).then(
                        function(list) {

                            // success!
                            //initialize list name field
                            $scope.list_name = '';
                            params={id:list.id}
                            //transition to list/thislist.id
                            $scope.$dismiss('saved');
                            $state.transitionTo("lists.list",params,{
                              //force transition default:false
                              reload:true,
                              //broadcast $stateChangeStart and $stateChangesuccess event default:false
                              notify:true,
                              //inherit url paramtere from current url
                              inherit:false
                            })
                        },
                        function (){
                            // error!
                            alert("jeeze something went wrong")
                        })
    }//cool here
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

app.config(['$stateProvider',function($stateProvider){
  //multiple views
  //this is when a given state has several views e.g lists has
  //create list view
  //edit list view
    $stateProvider.state('lists',{
      abstract:true,
      url:'/',
      //this template has a ui-view that gets populated by child template
      templateUrl:'/static/partials/list.html'
    })
    .state('lists.list',{
      //match a listID of 1 to 8 characters
      //url becomes /lists/list/id
      url:'list/{id:[0-9]{1,8}}',
      //this template is populated in a ui-view in the template list.html
      templateUrl:'/static/partials/item.html',
      //implement controller to load a lists items
      //get needed parameters from $stateParam
      controller:['$scope','$state','Restangular','$stateParams','utils',function($scope,$state,Restangular,$stateParams,utils){

          //lookup items in this list
          user_object = Restangular.all('user').getList().then(function(users){
          user=users[0].resource_uri;
          user_name=users[0].username;
          //GET lists created by the user
          //Restangular objects are self aware and can make know how to make their own requests
          //$object enables use these lists in template

          orderList_object = Restangular.all('orderlist/?user__username='+user_name+'&format=json&is_active=true');

          orderList_object.getList().then(function(lists){
            lists = lists;
            //get current list
            $scope.list=utils.getList(lists,$stateParams.id);
            //pass custom data on to child state
          })

          // create(POST) item and add it to target list
          $scope.order_items = [];
          $scope.addItem = function(isValid){
            if(isValid){

              //build our order item with required units
              $scope.order_items.unshift({item_description:$scope.item_description,note:$scope.note,
                created_by:user,modified_by:user,item_stamp:$scope.random_number,
                orderlist:$scope.list.resource_uri});
              $scope.submitted = true;

              //create item
              //returns a promise, reload the state
            create_item =  create_itemresource($scope,Restangular).then(function(){
                console.log("successful creation and state is "+ $state.current.name)

              });

            }

            //initialize our item text field
            $scope.item_description = '';
            $scope.note = '';
            $state.transitionTo("lists.list",$stateParams,{
              //force transition default:false
              reload:true,
              //broadcast $stateChangeStart and $stateChangesuccess event default:false
              notify:true,
              //inherit url paramtere from current url
              inherit:false
            })

            }


          //remove item from list
          $scope.deleteFromList=function(idx,list){
            var current_item = list.item[idx];
            //update to make on data
            var inactivate = {is_active:false}
            var patch_update_data = JSON.stringify(inactivate)
            //update item
            Restangular.all('list_item/'+current_item.id+'/').patch(patch_update_data).then(function(){
              //success
              //get index of list
              //var list_index=$scope.lists.indexOf(list);
              //remove item from view
              $scope.list.item.splice(idx,1);
            })
          }
        }
        )
      }]
    })
   .state('lists.createlist',{
      url:'new', //new list
      onEnter:['$stateParams','$state','$modal',function($stateParams,$state,$modal){
        $modal.open({
          //render our form
          templateUrl:'/static/partials/createlist.html',
          keyboard:false,
          backdrop:'static',
          //provide some logic
         controller: 'createlist'

        })

      }]

    })
    .state('edit',{
      url:'/list/{id:[0-9]{1,8}}/edit',
      //controller: listResourceController.listCtrl,
      //templateUrl:'/static/partials/editlist.html',
      onEnter:['$stateParams','$state','$modal',function($stateParams,$state,$modal){
        $modal.open({
          templateUrl:'/static/partials/editlist.html',
          keyboard:false,
          backdrop:'static',
          //provide logic
          controller:['$scope','$state','utils','Restangular',function($scope,$state,utils,Restangular){
            //lookup items in this list
            user_object = Restangular.all('user').getList().then(function(users){
            user=users[0].resource_uri;
            user_name=users[0].username;
            //GET lists created by the user
            //Restangular objects are self aware and can make know how to make their own requests
            //$object enables use these lists in template

            orderList_object = Restangular.all('orderlist/?user__username='+user_name+'&format=json&is_active=true');

            orderList_object.getList().then(function(lists){
              lists = lists;
              //get current list
              $scope.list=utils.getList(lists,$stateParams.id);
              $scope.lists = lists
            })
            $scope.dismiss = function(){
            //remove modal, something cameup
             $scope.$dismiss('clicked');
             //transition back to parent state
             return $state.transitionTo("lists.list",$stateParams,{
               //show list in view
               reload:true
             });
          }
          }
          )
          }]

        })
      }]
    })
    .state("assigntask",{
      url :'/list/{id:[0-9]{1,8}}/assigntask',//listid/assigntask
      onEnter:['Restangular','$stateParams','$state','$modal',function(Restangular,$stateParams,$state,$modal){
        $modal.open({
          templateUrl:'/static/partials/assigntask.html',
        /**  controller:**/

        })//modal functionality ends here
      }]//end of onEnter

    })//end of this state
    .state('lists.confirmation',{
      url:'orderconfirmation',
      templateUrl:'/static/partials/confirmation.html'
    })//end of confirmation state
  //  .state()
  }]);
app.config(['$urlRouterProvider',function($urlRouterProvider){
  $urlRouterProvider.otherwise("/");

}]);
