'use strict';

app.config(['$routeProvider', 'appconf', function($routeProvider, appconf) {
    $routeProvider
    .when('/login', {
        templateUrl: 't/login.html',
        controller: 'LoginController',
    })
    .when('/about', {
        templateUrl: 't/about.html',
        controller: 'AboutController',
    })
    .when('/submit', {
        templateUrl: 't/submit.html',
        controller: 'SubmitController',
        requiresLogin: true,
    })
    .when('/task/:taskid', {
        templateUrl: 't/task.html',
        controller: 'TaskController',
        requiresLogin: true
    })

    /*
    .when('/running', {
        templateUrl: 't/tasks.html',
        controller: 'RunningController',
        requiresLogin: true
    })
    .when('/finished', {
        templateUrl: 't/tasks.html',
        controller: 'FinishedController',
        requiresLogin: true
    })
    .when('/input/:type', {
        templateUrl: 't/input.html',
        controller: 'InputController',
        requiresLogin: true
    })
    .when('/import/:taskid', {
        templateUrl: 't/import.html',
        controller: 'ImportController',
        requiresLogin: true
    })
    */
    .otherwise({
        redirectTo: '/about'
    });
    //console.dir($routeProvider);
}]).run(['$rootScope', '$location', 'toaster', 'jwtHelper', 'appconf', '$http', 
function($rootScope, $location, toaster, jwtHelper, appconf, $http) {
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        //redirect to /login if user hasn't authenticated yet
        if(next.requiresLogin) {
            var jwt = localStorage.getItem(appconf.jwt_id);
            if(jwt == null || jwtHelper.isTokenExpired(jwt)) {
                toaster.info("Please login first");
                //sessionStorage.setItem('auth_redirect', window.location.toString());
                //window.location = appconf.auth_url;
                $location.path("/login");
                event.preventDefault();
            }
        }
    });
}]);

