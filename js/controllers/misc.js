'use strict';

app.controller('PageController', function($scope, appconf, jwtHelper, $location, $http, instance) {
    //set some common scope objects
    $scope.appconf = appconf;
    $scope.title = appconf.title;
    $scope.active_menu = "unknown";
    //$scope.menu = menu;

    //set $scope.user from jwt
    var jwt = localStorage.getItem(appconf.jwt_id);
    if(jwt) $scope.user = jwtHelper.decodeToken(jwt);

    //open another page inside the app.
    $scope.openpage = function(page) {
        console.log("path to "+page);
        $location.path(page);
    }

    //relocate out of the app..
    $scope.relocate = function(url) {
        document.location = url;
    }
    
    //load resource we need
    $scope.resources = {
        onere: null, 
        upload: null,
    };
    $http.get($scope.appconf.wf_api+"/resource", {params: {
        find: JSON.stringify({name: "onere"})
    }}).then(function(res) {
        $scope.resources.onere = res.data.resources[0];
        console.log("onere resource");
        console.dir($scope.resources.onere);
        $http.get($scope.appconf.wf_api+"/resource/best", {params: {
            service: $scope.appconf.upload_task_id,
        }}).then(function(res) {
            $scope.resources.upload = res.data.resource;
            console.log("upload resource");
            console.dir($scope.resources.upload);
        });
    }, console.dir);

    instance.then(function(_instance) {
        $scope.instance = _instance;
        
        //start event streaming
        var eventws = new ReconnectingWebSocket("wss:"+window.location.hostname+appconf.event_api+"/subscribe?jwt="+jwt);
        eventws.onopen = function(e) {
            console.log("eventws connection opened.. binding");
            eventws.send(JSON.stringify({
                bind: {
                    ex: "wf.task",
                    key: $scope.user.sub+"."+_instance._id+".#",
                }
            }));
        }
        eventws.onmessage = function(json) {
            var e = JSON.parse(json.data);
            if(e.msg) {
                var task = e.msg;
                //console.log([task._id, task.status, task.status_msg, task.next_date]);
                $scope.$broadcast("task_updated", task);
            } else {
                console.log("unknown message from eventws");
                console.dir(e);
            }
        }
        eventws.onclose = function(e) {
            console.log("eventws connection closed - should reconnect");
        }
    });
});
app.controller('ProjectsController', function($scope, toaster) {
    $scope.$parent.active_menu = "projects";
});
app.controller('RunsController', function($scope, toaster) {
    $scope.$parent.active_menu = "runs";
});

//new appdata
app.controller('NewController', function($scope, toaster, $window, $http, $location) {
    $scope.$parent.active_menu = "new";
    $scope.back = function() {
        $window.history.back();
    }

    //defaults
    $scope.form = {
        //name: ""
    };
    
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

    $scope.submit = function(form) {
        $http.post($scope.appconf.api+"/appdata", $scope.form)
        .then(function(res) {
            $location.path("/home");
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }
});

/*
app.controller('TaskController', function($scope, toaster, jwtHelper, $http, $window, $routeParams, $timeout, scaResource, scaTask) {
    $scope.menu_active = "finished";

    $scope.taskid = $routeParams.taskid;
    $scope.jwt = localStorage.getItem($scope.appconf.jwt_id);
    $scope.activetab = 0; //raw (TODO is this still used?)

    //$scope.task = scaTask.get($routeParams.taskid);
    $scope.task = scaTask.get($routeParams.taskid);

    $scope.back = function() {
        $window.history.back();
    }
});

//After you construct a container, this is where you can download it (or run it or whatever)
app.controller('ContainerController', function($scope, toaster, $routeParams) {
    var container_id = $routeParams.container_id;

    //TODO: Do Ajax call here to get all the important information about the container/data

    $scope.container = {
        "container_id": container_id,
        "name": "Some Container",
        "description": "Some Description",
        "details": "Ubuntu with Life and some other stuff",
        "data": "Data description",
        "data_location": "some location",
        "docker_command": "some command"
    };

    $scope.download_container = function(){
        alert("Downloading Docker Container " + $scope.container.container_id);
    };
    $scope.download_data = function(){
        alert("Downloading data for " + $scope.container.container_id);
    };
});
*/


