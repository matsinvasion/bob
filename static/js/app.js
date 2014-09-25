//declare app level module that depends on services,controllers
//register e on module loading alternative symbols for our django environment
app = angular.module('GroceryList',['restangular','itemResourceController','listResourceController']).
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

  });

//configure cross site forgery

/**app.run(function($http,$cookies){
  $http.defaults.headers.post['X-CSRFToken'] =$cookies.csrftoken;
  $http.defaults.xsrfCookieName= 'csrftoken';
  $http.defaults.xsrfHeaderName='X-CSRFToken';
})**/
