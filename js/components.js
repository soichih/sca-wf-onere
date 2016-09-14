'use strict';

//https://github.com/angular-ui/ui-select/issues/258
app.directive('uiSelectRequired', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            ctrl.$validators.uiSelectRequired = function(modelValue, viewValue) {
                //return modelValue && modelValue.length;
                return modelValue != "";
            };
        }
    };
});

app.directive('onoffbutton', function() {
    return {
        template: '<div ng-click="toggle()">{{b}}</div>',
        scope: {
            b: '=',
        },
        controller: function($scope) {
            if($scope.b === undefined) $scope.b = false;
            $scope.toggle = function() {
                $scope.b = !$scope.b;
            }
        }
    }
});
    
app.directive('apptype', function() {
    return {
        template: '<span class="label" ng-class="c">{{type}}</span>',
        scope: { type: '<' },
        controller: function($scope) {
            switch($scope.type) {
            case "docker": $scope.c = "label-primary"; break;
            case "dockerbuilder": $scope.c = "label-info"; break;
            case "bash": $scope.c = "label-success"; break;
            }
        }
    }
});
