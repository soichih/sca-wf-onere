'use strict';

app.config(['$routeProvider', 'appconf', function($routeProvider, appconf) {
    $routeProvider
    /*
    .when('/login', {
        templateUrl: 't/login.html',
        controller: 'LoginController',
    })
    */
    .when('/home', {
        templateUrl: 't/home.html',
        controller: 'HomeController',
    })
    .when('/projects', {
        templateUrl: 't/projects.html',
        controller: 'ProjectsController',
        requiresLogin: true
    })
    .when('/datasets', {
        templateUrl: 't/datasets.html',
        controller: 'DatasetsController',
        requiresLogin: true
    })
    .when('/apps', {
        templateUrl: 't/apps.html',
        controller: 'AppsController',
        requiresLogin: true
    })
    .when('/runs', {
        templateUrl: 't/runs.html',
        controller: 'RunsController',
        requiresLogin: true
    })
    .when('/appdata', {
        templateUrl: 't/appdata.html',
        controller: 'AppdataController',
        requiresLogin: true
    })
    .when('/view/appdata/:id', {
        templateUrl: 't/viewappdata.html',
        controller: 'ViewappdataController',
    })
 
    /*
    .when('/submit', {
        templateUrl: 't/submit.html',
        controller: 'SubmitController',
        requiresLogin: true
    })
    .when('/task/:taskid', {
        templateUrl: 't/task.html',
        controller: 'TaskController',
        requiresLogin: true
    })
    .when('/search', {
        templateUrl: 't/search.html',
        controller: 'SearchController',
        requiresLogin: true
    })
    .when('/main', {
        templateUrl: 't/main.html',
        controller: 'MainController',
        requiresLogin: true
    })
    .when('/container/:container_id', {
        templateUrl: 't/container.html',
        controller: 'ContainerController',
        requiresLogin: true
    })
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
        redirectTo: '/home'
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
                sessionStorage.setItem('auth_redirect', window.location.toString());
                window.location = appconf.auth_url;
                event.preventDefault();
            }
        }
    });
}]);
