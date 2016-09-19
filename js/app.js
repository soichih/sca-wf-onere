'use strict';

var getAbsoluteUrl = (function() {
    var a;
    return function(url) {
        if(!a) a = document.createElement('a');
        a.href = url;
        return a.href;
    };
})();

var app = angular.module('app', [
    'app.config',
    'ngRoute',
    'ngAnimate',
    'ngCookies',
    'toaster',
    'angular-loading-bar',
    'angular-jwt',
    'ui.bootstrap',
    'ui.bootstrap.modal',
    'ui.bootstrap.tooltip',
    'ui.select',
    'ui.gravatar',
    'ui.ace',
    'ngSanitize', //used by ui-select (sometimes?)
    'sca-ng-wf',
    'sca-shared',
    'sca-product-raw',
    'yaru22.angular-timeago',
]);

//can't quite do the slidedown animation through pure angular/css.. borrowing slideDown from jQuery..
app.animation('.slide-down', ['$animateCss', function($animateCss) {
    return {
        enter: function(elem, done) {
            $(elem).hide().slideDown("fast", done);
        },
        leave: function(elem, done) {
            $(elem).slideUp("fast", done);
        }
    };
}]);

//http://plnkr.co/edit/YWr6o2?p=preview
app.directive('ngConfirmClick', [
    function() {
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click',function (event) {
                    if ( window.confirm(msg) ) {
                        scope.$eval(clickAction)
                    }
                });
            }
        };
    }
]);

//show loading bar at the top
app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.latencyThreshold = 500;
}]);

//configure httpProvider to send jwt unless skipAuthorization is set in config (not tested yet..)
app.config(function(appconf, $httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.tokenGetter = function(jwtHelper, $http) {
        //don't send jwt for template requests (I don't think angular will ever load css/js - browsers do)
        //if (config.url.substr(config.url.length - 5) == '.html') return null;
        var jwt = localStorage.getItem(appconf.jwt_id);
        if(!jwt) return null;
        var expdate = jwtHelper.getTokenExpirationDate(jwt);
        var ttl = expdate - Date.now();
        if(ttl < 0) {
            localStorage.removeItem(appconf.jwt_id);
            document.location = appconf.auth_url;
        }
        return jwt;
    }
    $httpProvider.interceptors.push('jwtInterceptor');
});

/*
//load menu and profile by promise chaining
app.factory('menu', function(appconf, $http, jwtHelper, $sce, scaMessage, scaMenu, toaster) {
    var jwt = localStorage.getItem(appconf.jwt_id);
    var menu = {
        header: {
        },
        top: scaMenu,
        user: null, //to-be-loaded
    };
    if(appconf.icon_url) menu.header.icon = $sce.trustAsHtml("<img src=\""+appconf.icon_url+"\">");
    if(appconf.home_url) menu.header.url = appconf.home_url
    var jwt = localStorage.getItem(appconf.jwt_id);
    if(jwt) {
        var expdate = jwtHelper.getTokenExpirationDate(jwt);
        var ttl = expdate - Date.now();
        if(ttl < 0) {
            toaster.error("Your login session has expired. Please re-sign in");
            localStorage.removeItem(appconf.jwt_id);
        } else {
            menu.user = jwtHelper.decodeToken(jwt);
            if(ttl < 3600*1000) {
                //jwt expring in less than an hour! refresh!
                console.log("jwt expiring in an hour.. refreshing first");
                $http({
                    url: appconf.auth_api+'/refresh',
                    method: 'POST'
                }).then(function(response) {
                    var jwt = response.data.jwt;
                    localStorage.setItem(appconf.jwt_id, jwt);
                    menu.user = jwtHelper.decodeToken(jwt);
                });
            }
        }
    }
    return menu;
});
*/

