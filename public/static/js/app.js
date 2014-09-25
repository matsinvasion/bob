//declare app level module that depends on services,controllers
//register e on module loading alternative symbols for our django environment
app = angular.module('GroceryList',['restangular','ui.bootstrap','ui.router','itemResourceController','listResourceController']).
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
        extractedData = data.data
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
      templateUrl:'/static/partials/item.html',
      //implement controller to load a lists items
      //get needed parameters from $stateParam
      controller:['$scope','Restangular','$stateParams','utils',function($scope,Restangular,$stateParams,utils){

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
          })
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
    });


  /**  .state('lists.createlist',{
      url:'new', //new list
      onEnter:['$stateParams','$state','$modal',function($stateParams,$state,$modal){
        $modal.open({
          //render our form
          templateUrl:'/static/partials/createlist.html',
          keyboard:false,
          backdrop:'static',


          //provide some logic
          controller: ['$scope',function($scope){
            $scope.dismiss = function(){
            //remove modal, something cameup
             $scope.$dismiss('clicked');
             //transition back to parent state
             return $state.transitionTo("lists",$stateParams,{
               //show list in view
               reload:true
             });
          }

          }]

        })

      }]

    })
    .state('lists.list',{
      //match a listID of 1 to 8 characters
      url:'list/{id:[0-9]{1,8}}',
      templateUrl:'/static/partials/item.html'
    });
    //.state**/
  }]);
app.config(['$urlRouterProvider',function($urlRouterProvider){
  $urlRouterProvider.otherwise("/");

}]);
