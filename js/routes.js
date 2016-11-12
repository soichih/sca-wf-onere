'use strict';

app.config(['$routeProvider', 'appconf', function($routeProvider, appconf) {
    $routeProvider

    //public pages
    .when('/home', {
        templateUrl: 't/home.html',
        controller: 'HomeController',
    })
    .when('/view/app/:id', {
        templateUrl: 't/viewapp.html',
        controller: 'ViewappController',
    })

    //user pages
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
    .when('/runs/:task_id?', {
        templateUrl: 't/runs.html',
        controller: 'RunsController',
        requiresLogin: true
    })
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
