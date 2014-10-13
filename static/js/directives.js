//directive that manipulates dom
var datetimepickerdirective = angular.module('datetimepicker',[]);
var datetimepicker = function(){
  return{
    require:'?ngModel',
    restrict:'AE',
    link:function (scope,elem,atrr){
      elem.datetimepicker().on('changedate',function(event){
        $scope.$apply(function(){
          ngModel.$setViewValue(event.date);
        });
      });
    };
  };
};
