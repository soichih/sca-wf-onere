'use strict';

app.controller('HomeController', function($scope, toaster, $http, $timeout, $location) {
    $scope.$parent.active_menu = "home";

    //for searching
    $scope.searchterm = "";
    $scope.clear_searchterm = function() {
        $scope.searchterm = "";
    }
    var search_timer;
    $scope.update_search = function() {
        $timeout.cancel(search_timer); //cancel previous timer
        search_timer = $timeout(function() {
            search_app(); 
        }, 300);
    }

    //run initial search
    search_app();

    function search_app() {
        //load app
        var query = {
            sort: '-create_date', //newer ones first
            select: 'name desc user_id datasets config project_id create_date',
            limit: 500,
        }
        if($scope.searchterm) {
            query.find = JSON.stringify({
                "$or": [
                    {"$text": {"$search": $scope.searchterm}}
                ] 
            });
        }
        $http.get($scope.appconf.api+"/application", {params: query})
        .then(function(res) {
            console.log("applications loaded");
            console.dir(res.data.applications);
            $scope.apps = res.data.applications;
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }
    
    /*
    $scope.add = function() {
        $location.path("/new");
    }
    */
    $scope.open = function(app) {
        $location.path("/view/app/"+app._id);
    }
});

