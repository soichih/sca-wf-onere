'use strict';

app.controller('AppsController', function($scope, toaster, $http, $timeout) {
    $scope.$parent.active_menu = "apps";
    $scope.selected_app = null;
    $scope.resource_types = [];

    $scope.docker_templates = {
        "NeuroDebian": "FROM neurodebian\n\nRUN apt-get update && apt-get install -y \\\n  mrtrix \\\n  mriconvert\n\nCMD [\"mrconvert\", \"/input/test.nii\", \"/output/test.mif\"]",
        "CentOS6": "FROM centos:6\n\nRUN yum update & yum install -y \\\n  something \\\n  otherthing\n\nCMD [\"/app/something\", \"-someparam\"]\n"
    }
    $scope.dockerfile_set = function(content) {
        if(!$scope.selected_app) return;//app not yet selected
        $scope.selected_app.config.dockerfile = content;
        $scope.save_app();
    }
 
    //load apps
    $http.get($scope.appconf.api+"/application", { params: {
        sort: '-create_date', //newer ones first
        select: 'name desc config create_date',
        
        //TODO - I will probably allow application from user's projects
        find: JSON.stringify({
            user_id: $scope.user.sub
        })
    }})
    .then(function(res) {
        $scope.apps = res.data.applications;
        if($scope.apps.length > 0) {
            $scope.select_app($scope.apps[0]);
        }
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });

    //load resource types
    $http.get($scope.appconf.wf_api+"/resource/types")
    .then(function(res) {
        $scope.resource_types = res.data;
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });

    $scope.select_app = function(app) {
        console.log("selecting app");
        console.log(app);
        $scope.selected_app = app;
    }

    $scope.types = [
        { id: "docker", label: "Docker" }, 
        { id: "dockerbuilder", label: "Docker Builder" }, 
        { id: "bash", label: "Bash Script" }, 
    ];

    $scope.add_app = function() {
        var app = {
            config: {
                type: "docker",
                container: "bids/example:0.0.4",
                bash: "#!/bin/bash\n",
            }
        };
        //register empty app
        $http.post($scope.appconf.api+"/application", {})
        .then(function(res) {
            var newapp = res.data;
            $scope.apps.unshift(newapp);
            $scope.select_app(newapp);
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }

    var save_timer;
    $scope.save_app = function() {
        var app = $scope.selected_app;
        if(!app) return; //app not yet selected
        $timeout.cancel(save_timer); //clear previous timer
        save_timer = $timeout(function() {
            $http.put($scope.appconf.api+"/application/"+app._id, app)
            .then(function(res) {
                console.log("updated");
                console.dir(res);
            }, function(res) {
                if(res.data && res.data.message) toaster.error(res.data.message);
                else toaster.error(res.statusText);
            });
        }, 1000);
    }

    $scope.delete = function() {
        if(!$scope.selected_app) return;//app not yet selected

        //TODO - popup confirmation dialog first? 
        $http.delete($scope.appconf.api+"/application/"+$scope.selected_app._id)
        .then(function(res) {
            toaster.warning("Successfully removed an application: "+$scope.selected_app.name);
            $scope.apps.splice($scope.apps.indexOf($scope.selected_app), 1);
            $scope.selected_app = null;
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }
});

