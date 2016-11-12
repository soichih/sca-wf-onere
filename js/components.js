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

/*
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
*/
    
app.directive('apptype', function() {
    return {
        template: '<span class="label" ng-class="c">{{type}}</span>',
        scope: { type: '<' },
        controller: function($scope) {
            $scope.$watch('type', function() {
                switch($scope.type) {
                case "docker": $scope.c = "label-primary"; break;
                case "dockerbuilder": $scope.c = "label-info"; break;
                case "bash": $scope.c = "label-success"; break;
                }
            });
        }
    }
});

app.directive('taskstatus', function() {
    return {
        template: '<span class="label" ng-class="c"><!--<i class="fa fa-cog fa-spin" aria-hidden="true" ng-if="status == \'running\'"></i> -->{{status|uppercase}}</span>',
        scope: { status: '<' },
        controller: function($scope) {
            $scope.$watch('status', function() {
                switch($scope.status) {
                case "requested": 
                    $scope.c = "label-info"; break;
                case "running": 
                case "running_sync": 
                    $scope.c = "label-primary"; break;
                case "failed": 
                    $scope.c = "label-danger"; break;
                case "finished": 
                    $scope.c = "label-success"; break;
                default:
                    $scope.c = "label-warning"; 
                }
            });
        }
    }
});

app.directive('scaprofile', function() {
    return {
        template: '<img gravatar-src="profile.email" width="14"></img> {{profile.fullname}} <a ng-if="email" href="mailto:{{profile.email}}">&lt;{{profile.email}}&gt;</a>',
        scope: { id: '<', email: '<'},
        controller: function($scope, profile) {
            if($scope.email === undefined) $scope.email = true; //show by default

            $scope.$watch('id', function() {
                if($scope.id) {
                    console.log("loading sca profile from "+$scope.id);
                    $scope.profile = profile.get($scope.id);
                }
            });
        }
    }
});

app.directive('doi', function() {
    return {
        //template: '<small>doi:10.5967/XX{{id}}</small>',
        template: '<a target="_blank" href="http://dx.doi.org/10.5967/{{type}}.{{id}}"><img src="https://zenodo.org/badge/doi/10.5967/{{type}}.{{id}}.svg" alt="10.5967/{{type}}.{{id}}"></a>',
        scope: { type: '<', id: '<'},
        controller: function($scope, profile) {
            //TODO - do something with type
        }
    }
});



