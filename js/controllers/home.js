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
            search_appdata(); 
        }, 300);
    }

    //run initial search
    search_appdata();

    function search_appdata() {
        //load appdatas
        var query = {
            sort: '-create_date', //newer ones first
            select: 'name desc user_id application_id dataset_id project_id create_date',
            limit: 500,
        }
        if($scope.searchterm) {
            query.find = JSON.stringify({
                "$or": [
                    {"$text": {"$search": $scope.searchterm}}
                ] 
            });
        }
        $http.get($scope.appconf.api+"/appdata", { params: query})
        .then(function(res) {
            $scope.appdatas = res.data.appdatas;
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }
    
    $scope.add = function() {
        $location.path("/new");
    }
    $scope.open = function(appdata) {
        $location.path("/view/appdata/"+appdata._id);
    }
});

