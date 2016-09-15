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
            switch($scope.type) {
            case "docker": $scope.c = "label-primary"; break;
            case "dockerbuilder": $scope.c = "label-info"; break;
            case "bash": $scope.c = "label-success"; break;
            }
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

/*
app.directive('dirDisqus', function($window) {
    return {
        restrict: 'E',
        scope: {
            disqus_shortname: '@disqusShortname',
            disqus_identifier: '@disqusIdentifier',
            disqus_title: '@disqusTitle',
            disqus_url: '@disqusUrl',
            disqus_category_id: '@disqusCategoryId',
            disqus_disable_mobile: '@disqusDisableMobile',
            readyToBind: "@"
        },
        template: '<div id="disqus_thread"></div><a href="http://disqus.com" class="dsq-brlink">comments powered by <span class="logo-disqus">Disqus</span></a>',
        link: function(scope) {

            scope.$watch("readyToBind", function(isReady) {

                // If the directive has been called without the 'ready-to-bind' attribute, we
                // set the default to "true" so that Disqus will be loaded straight away.
                if ( !angular.isDefined( isReady ) ) {
                    isReady = "true";
                }
                if (scope.$eval(isReady)) {
                    console.log(scope.disqus_identifier);
                    // put the config variables into separate global vars so that the Disqus script can see them
                    $window.disqus_shortname = scope.disqus_shortname;
                    $window.disqus_identifier = scope.disqus_identifier;
                    $window.disqus_title = scope.disqus_title;
                    $window.disqus_url = scope.disqus_url;
                    $window.disqus_category_id = scope.disqus_category_id;
                    $window.disqus_disable_mobile = scope.disqus_disable_mobile;

                    // get the remote Disqus script and insert it into the DOM
                    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                    dsq.src = '//' + scope.disqus_shortname + '.disqus.com/embed.js';
                    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
                }
            });
        }
    };
});
*/
