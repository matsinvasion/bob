//declare app level module that depends on services,controllers
//register e on module loading alternative symbols for our django environment
app = angular.module('GroceryList',['restangular','xeditable','ui.router','ui.bootstrap',
'itemResourceController']).
  config(function($interpolateProvider,$httpProvider,RestangularProvider){
    $httpProvider.defaults.xsrfCookieName= 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName='X-CSRFToken';
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
    //base url for our api calls
    RestangularProvider.setBaseUrl('/api/v1');
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

  $scope.assign=function(isValid){
    if(isValid){
      user_object = Restangular.all('user').getList().then(function(user){
        user_uri=user[0].resource_uri;

        //order objnect
        order_object = {address:$scope.address,mobile:$scope.mobile,
        comment:$scope.comment,created_by:user_uri,modified_by:user_uri};
        patch_object=JSON.stringify({order:order_object});

        //update list to add order
        Restangular.all('orderlist/'+$stateParams.id+'/').patch(patch_object).then(function(list){
          //create an instance of Assignment
          //use returned object from server per user
          var created_by = list.created_by;
          var modified_by = list.modified_by;
          //json object to create via endpoint
          var assignment = JSON.stringify({created_by:created_by,modified_by:modified_by,
          orderlist:list.resource_uri});
          //make request
          Restangular.all('assignments/').post(assignment).then(function(){
            //success
            //dismiss modal
            $scope.$dismiss('saved');
            //transition to confirmation
            $state.transitionTo('lists.confirmation',null,{
              reload:true
            })

          },function(){
            //error
            window.alert("Jeeze, something went wrong, please try again. If problem persists contact us.")
          })//end of Assignment creations
        })//orderlist promise ends here
      })//user promise ends here

    }else if(!isValid){
      alert("Be sure to fill in the necessary fields")

    }

  }
  //on canceling moda
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

}])
app.controller('edit',['$scope','$state','$stateParams','Restangular',function($scope,$state,$stateParams,Restangular){
  $scope.editList=function(id,isValid){
    if(isValid){
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

    }else if(!isValid){
      alert("Be sure to provide list title and scheduled time");
    }
  }//end of editList()
  //delete a list from user view
  //make is_active=false in database instead of complete removal
  //use Array.Splice to remove a particular item from array
  //also ng-repeate gives us access to special $index property
  //which is current index of array passed in
  $scope.delete = function(id){
    //list to delete
  //  var list_to_delete = $scope.lists[idx];
    //update to make on data
    var inactivate = {is_active:false}
    var patch_update_data = JSON.stringify(inactivate)
    //update list
    Restangular.all('orderlist/'+id+'/').patch(patch_update_data)
    .then(function(){
      //success
      //remove list from view

      $scope.lists.splice(idx,1);

    }),function(){
      //error
      alert("Jeez that didn't go well.Give us a moment to fix it.")
    }
  }//end of delete
}])
//list  controller

app.controller('listCtrl',['$scope','$document','$state','utils','$stateParams',
'Restangular','$q',function($scope,$document,$state,utils,
  $stateParams,Restangular){
    //set list col height
  var lists_col = $document[0].getElementById('lists');
  if (lists_col){lists_col.style.minHeight=window.innerHeight+'px'};
  //avail our scope in browser console
  window.listResource_SCOPE = $scope;


  //GET current user
  //this is prbably wrong
  console.log(Restangular.all('user'))
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
    //current list
    $scope.current_list=utils.getList($scope.lists,$stateParams.id);
    });

  //dismiss create list form | modal
  $scope.dismiss = function(){
    $scope.$dismiss('dismmised')
    //will redirect to the home list
    $state.transitionTo('lists.list',null,{
      //force transition default:false
      reload:false,
      //broadcast $stateChangeStart and $stateChangesuccess event default:false
      notify:false,
      //inherit url paramtere from current url
      inherit:false
    })
  }//dismiss() ends here

  //create list
  $scope.listobject = {};
  $scope.createlist=function(isValid,list_array){
    if(isValid){
      //object expected by resource
      $scope.listobject = {title:$scope.list_name,scheduled_time:$scope.scheduledTime,created_by:$scope.user,modified_by:$scope.user,user:$scope.user};
      $scope.submitted = true;
      createListResource($scope,Restangular).then(
                        function(list) {
                            // success!
                            //initialize list name field
                            $scope.list_name = '';
                            $scope.lists.unshift(list)
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
                            alert("jeeze something went wrong");
                        })
    }else if(!isValid){
      alert("Be sure to provide a List Title and Scheduled Time");
    }
  }//createlist()ends here
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


//
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
  }//dismiss() ends here
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
                            alert("jeeze something went wrong");
                        })
    }else if(!isValid){
      console.log(isValid)
      alert("Be sure to provide a List Title and Scheduled Time");
    }
  }//createlist()ends here

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
    .state('lists.home',{
      //home,
      url:'lists',
      templateUrl:'/static/partials/item.html',
    })
    .state('lists.list',{
      //this state represents a single list
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
          $scope.addItem = function(isValid,list_item){
            if(isValid){

              //populate view with new items
              list_item.unshift({item_description:$scope.item_description,note:$scope.note,
                created_by:user,modified_by:user,item_stamp:$scope.random_number,
                orderlist:$scope.list.resource_uri})
              //create new items
              $scope.order_items.unshift({item_description:$scope.item_description,note:$scope.note,
                created_by:user,modified_by:user,item_stamp:$scope.random_number,
                orderlist:$scope.list.resource_uri});
              $scope.submitted = true;

              //create item
              //returns a promise, reload the state
            $scope.created_item =  create_itemresource($scope,Restangular).then(function(item){
              //$scope.created_item_id=item;
              //console.log($scope.created_item_id.objects[0].item_description)
              list_item[0].id=item.objects[0].id
              ///console.log(list_item[0])

              });
              //console.log("created item id is "+$scope.created_item_id)

            }else if(!isValid){
              alert("Seems, you didn't provide a list item.")
            }

            //initialize our item text field
            $scope.item_description = '';
            $scope.note = '';
            $state.transitionTo("lists.list",$stateParams,{
              //force transition default:false
              reload:false,
              //broadcast $stateChangeStart and $stateChangesuccess event default:false
              notify:false,
              //inherit url paramtere from current url
              inherit:false
            })

            }


          //remove item from list
          $scope.deleteFromList=function(item){
            //var current_item = list.item[idx];
            //update to make on data
            var inactivate = {is_active:false}
            var patch_update_data = JSON.stringify(inactivate)
            if(item.id){
              $scope.list.item.splice($scope.list.item.indexOf(item),1);
              //inactivate item in database
              //update item
              Restangular.all('list_item/'+item.id+'/').patch(patch_update_data).then(function(){
                //success
                //get index of list
                //var list_index=$scope.lists.indexOf(list);
                //remove item from view

              })


            }else{
              console.log("am here")
              //get item at idx
              item_removed = $scope.list.item[idx];
              item_removed.is_active = false;

              $scope.list.item.splice(item_removed,1);


            }
          }
        }
        )
      }]
    })
   .state('lists.createlist',{
     //here we create a new list
      url:'new', //new list
      onEnter:['$stateParams','$state','$modal',function($stateParams,$state,$modal){
        $modal.open({
          //render our form
          templateUrl:'/static/partials/createlist.html',
          keyboard:false,
          backdrop:'static',
          size:'lg',
          //provide some logic
         controller: 'listCtrl'

        })

      }]

    })
    .state('lists.edit',{
      //in this state we edit a given lists
      url:'list/{id:[0-9]{1,8}}/edit',
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
            $scope.deletelist=function(id,list){
              removed_list_idx = $scope.lists.indexOf(list);

              $scope.lists.splice(removed_list_idx,1);
              patch_data = JSON.stringify({is_active:false})
              Restangular.all('orderlist/'+id+'/').patch(patch_data).then(function(list){
                //success
                //should transition to next list
                //but how do we achieve that
                $scope.$dismiss("closed");
                $state.transitionTo("lists.list",null,{
                  reload:true,
                  notify:true,
                  inherit:false
                })//end of state transition
                ,function(){
                  //error
                  alert("Something didn't go right,please try again.")
                }

              })//end of promise
            }//end of deletelist()
            $scope.dismiss = function(i){
            //remove modal, something cameup
             $scope.$dismiss('clicked');
             //transition back to parent state
             return $state.transitionTo("lists.list",null,{
               //show list in view
               reload:false,
               notify:false,
               inherit:false,
             });
          }
          }
          )
          }]

        })
      }]
    })
    .state("lists.assigntask",{
      //submit a list to dobby
      url :'list/{id:[0-9]{1,8}}/assigntask',//listid/assigntask
      onEnter:['Restangular','$stateParams','$state','$modal',function(Restangular,$stateParams,$state,$modal){
        $modal.open({
          templateUrl:'/static/partials/assigntask.html',
          keyboard:false,
          backdrop:'static',

        /**  controller:**/

        })//modal functionality ends here
      }]//end of onEnter

    })//end of this state
    .state('lists.confirmation',{
      //confirm recieving of a list
      url:'orderconfirmation',
      templateUrl:'/static/partials/confirmation.html'
    })//end of confirmation state
  //  .state()
  }]);
app.config(['$urlRouterProvider',function($urlRouterProvider){
  $urlRouterProvider.when("/","lists")
  $urlRouterProvider.otherwise("/");


}]);
