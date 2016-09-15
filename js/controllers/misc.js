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

app.controller('ViewappdataController', function($scope, toaster, $window, $http, $location, $routeParams, onere) {
    $scope.$parent.active_menu = "home";

    var appdata_id = $routeParams.id;

    /*
    disqus_config = function () {
        this.page.url = "https://soichi7.ppa.iu.edu/wfui/onere";
        this.page.identifier = "appdata/"+appdata_id;
    };
    */
    
    //load appdata specified
    $http.get($scope.appconf.api+"/appdata/"+appdata_id)
    .then(function(res) {
        $scope.appdata = res.data;
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });
    $scope.back = function() {
        $location.path("/home");
    }

    $scope.download = function(file) {
        var path = encodeURIComponent(file.dir+"/"+file.filename);
        var jwt = localStorage.getItem($scope.appconf.jwt_id);
        console.dir($scope.resources.onere._id);
        document.location = $scope.appconf.wf_api+"/resource/download?r="+$scope.resources.onere._id+"&p="+path+"&at="+jwt;
    }
    $scope.edit = function() {
        $location.path("/appdata/"+appdata_id);
    }

    //doesn't work.. need more work
    DISQUS.reset({
      reload: true,
      config: function () {  
        console.log("resetting disqus "+appdata_id);
        this.page.identifier = appdata_id;
        this.page.url = "https://soichi7.ppa.iu.edu/wfui/onere/";
      }
    });

    $scope.execute = function() {
        if(!$scope.selected) return; //app not yet selected
        onere.execute($scope.selected).then(function(onere_task) {
            toaster.success("Submitted a new onere execution");
            $location.path("#/execute/"+onere_task._id);
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


