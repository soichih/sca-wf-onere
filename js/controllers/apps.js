'use strict';

app.controller('AppsController', function($scope, toaster, $http, $timeout, onere, $location) {
    $scope.$parent.active_menu = "apps";
    $scope.selected = null;
    $scope.resource_types = [];

    $scope.docker_templates = {
        "NeuroDebian": "FROM neurodebian\n\nRUN apt-get update && apt-get install -y \\\n  mrtrix \\\n  mriconvert\n\nCMD [\"mrconvert\", \"/input/test.nii\", \"/output/test.mif\"]",
        "CentOS6": "FROM centos:6\n\nRUN yum update & yum install -y \\\n  something \\\n  otherthing\n\nCMD [\"/app/something\", \"-someparam\"]\n"
    }
    $scope.dockerfile_set = function(content) {
        if(!$scope.selected) return;//app not yet selected
        $scope.selected.config.dockerfile = content;
        $scope.save();
    }
    
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
 
    //load apps
    $http.get($scope.appconf.api+"/application", { params: {
        sort: '-create_date', //newer ones first
        select: 'name desc datasets config create_date',
        
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
        $scope.resource_types = {
            //injecting random resource types for demo purpose
            jetstream_m: {name: "Jetstream VM (medium)"},
            jetstream_l: {name: "Jetstream VM (large)"},
            jetstream_xl: {name: "Jetstream VM (xlarge)"},
        };
        console.dir(res.data);
        for(var key in res.data) {
            var detail = res.data[key];
            if(detail.type == "ssh") $scope.resource_types[key] = detail;
        }
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });

    $scope.select_app = function(app) {
        console.log("selecting app");
        console.log(app);
        $scope.selected = app;
    }

    $scope.types = [
        { id: "docker", label: "Docker" }, 
        { id: "dockerbuilder", label: "Docker Builder" }, 
        { id: "bash", label: "Bash Script" }, 
    ];

    $scope.add_app = function() {
        //register empty app
        $http.post($scope.appconf.api+"/application", {
            //default
            config: {
                type: "docker",
                container: "bids/example:0.0.4",
                bash: "#!/bin/bash\n",
                prescript: "#!/bin/bash\n\n#optional script to massage your input datasets",
            },
            //datasets: [],
        })
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
    $scope.save = function() {
        var app = $scope.selected;
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
        if(!$scope.selected) return;//app not yet selected

        //TODO - popup confirmation dialog first? 
        $http.delete($scope.appconf.api+"/application/"+$scope.selected._id)
        .then(function(res) {
            toaster.success("Successfully removed an application: "+$scope.selected.name);
            $scope.apps.splice($scope.apps.indexOf($scope.selected), 1);
            $scope.selected = null;
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }

    $scope.add_dataset = function() {
        if(!$scope.selected) return;//app not yet selected
        if($scope.selected.datasets == undefined) $scope.selected.datasets = [];
        $scope.selected.datasets.push({name: "input"+($scope.selected.datasets.length+1), id: null});
        $scope.save();
    }
    $scope.delete_dataset = function(dataset) {
        if(!$scope.selected) return;//app not yet selected
        var idx = $scope.selected.datasets.indexOf(dataset);
        $scope.selected.datasets.splice(idx, 1);
        $scope.save();
    }
    $scope.execute = function() {
        if(!$scope.selected) return; //app not yet selected
        onere.execute($scope.selected, $scope.instance, $scope.resources.onere).then(function(task) {
            toaster.success("Submitted a new onere execution");
            $location.path("/runs/"+task._id);
        }, function(err) {
            toaster.error(err);
        });
    }
});

