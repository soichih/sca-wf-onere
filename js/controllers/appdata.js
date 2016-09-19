app.controller('AppdataController', function($scope, toaster, $window, $http, $location, $timeout, onere) {
    $scope.$parent.active_menu = "appdata";
    $scope.selected = null;
    /*
    $scope.back = function() {
        $window.history.back();
    }

    //defaults
    $scope.form = {
        //name: ""
    };
    */
    
    //load appdatas
    $http.get($scope.appconf.api+"/appdata", { params: {
        sort: '-create_date', //newer ones first
        select: 'name desc application_id project_id dataset_id create_date',

        //TODO - I will probably allow datasets from user's projects
        find: JSON.stringify({
            user_id: $scope.user.sub
        })
    }})
    .then(function(res) {
        $scope.appdatas = res.data.appdatas;
        //unpopulate dataset_id, application_id, and project_id
        $scope.appdatas.forEach(function(appdata) {
            if(appdata.dataset_id) appdata.dataset_id = appdata.dataset_id._id;
            if(appdata.application_id) appdata.application_id = appdata.application_id._id;
            if(appdata.project_id) appdata.project_id = appdata.project_id._id;
        });
        //select first one
        if($scope.appdatas.length > 0) {
            $scope.select($scope.appdatas[0]);
        }
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });
    
    //load projects
    $http.get($scope.appconf.api+"/project", { params: {
        sort: '-create_date', //newer ones first
        select: 'name desc create_date',

        //TODO - for now, load all projects
        /*
        find: JSON.stringify({
            user_id: $scope.user.sub
        })
        */
    }})
    .then(function(res) {
        $scope.projects = res.data.projects;
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });
    
    //load datasets
    $http.get($scope.appconf.api+"/dataset", { params: {
        sort: '-create_date', //newer ones first
        select: 'name desc create_date',

        //TODO - I will probably allow datasets from user's projects
        find: JSON.stringify({
            user_id: $scope.user.sub
        })
    }})
    .then(function(res) {
        $scope.datasets = res.data.datasets;
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });
    
    //load applications
    $http.get($scope.appconf.api+"/application", { params: {
        sort: '-create_date', //newer ones first
        select: 'name desc create_date',

        //TODO - I will probably allow datasets from user's projects
        find: JSON.stringify({
            user_id: $scope.user.sub
        })
    }})
    .then(function(res) {
        $scope.applications = res.data.applications;
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });

    $scope.select = function(app) {
        $scope.selected = app;
        //do I need to load anything else?
    }

    $scope.add = function() {
        var appdata = {
            //default?
        };
        $http.post($scope.appconf.api+"/appdata", {})
        .then(function(res) {
            var newappdata = res.data;
            $scope.appdatas.unshift(newappdata);
            $scope.select(newappdata);
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }

    var save_timer;
    $scope.save = function() {
        if(!$scope.selected) return; //app not yet selected
        $timeout.cancel(save_timer); //clear previous timer
        save_timer = $timeout(function() {
            $http.put($scope.appconf.api+"/appdata/"+$scope.selected._id, $scope.selected)
            .then(function(res) {
                console.log("updated!");
                console.dir(res);
            }, function(res) {
                if(res.data && res.data.message) toaster.error(res.data.message);
                else toaster.error(res.statusText);
            });
        }, 1000);
    }

    $scope.delete = function() {
        if(!$scope.selected) return;//app not yet selected

        //TODO - popup confirmation dialog first? 
        $http.delete($scope.appconf.api+"/appdata/"+$scope.selected._id)
        .then(function(res) {
            toaster.success("Successfully removed app/data entry: "+$scope.selected.name);
            $scope.apps.splice($scope.apps.indexOf($scope.selected), 1);
            $scope.selected = null;
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }

    $scope.execute = function() {
        if(!$scope.selected) return; //app not yet selected
        onere.execute($scope.selected, $scope.instance).then(function(onere_task) {
            toaster.success("Submitted a new onere execution");
            $location.path("#/execute/"+onere_task._id);
        });
    }

    /*
    $scope.submit = function(form) {
        $http.post($scope.appconf.api+"/appdata", $scope.form)
        .then(function(res) {
            $location.path("/home");
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }

    //ui-select debug
    $scope.itemArray = [
        {id: 1, name: 'first'},
        {id: 2, name: 'second'},
        {id: 3, name: 'third'},
        {id: 4, name: 'fourth'},
        {id: 5, name: 'fifth'},
    ];
    $scope.selected = { value: $scope.itemArray[0] };
    */
});

