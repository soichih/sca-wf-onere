'use strict';

app.controller('PageController', function($scope, appconf, $route, jwtHelper, $location, $http) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;

    var jwt = localStorage.getItem(appconf.jwt_id);
    if(jwt) $scope.user = jwtHelper.decodeToken(jwt);

    $scope.openpage = function(page) {
        $location.path(page);
    }
});


app.controller('AboutController', function($scope, toaster) {
});

app.controller('HomeController', function($scope, toaster) {
});

app.controller('LoginController', function($scope, toaster, jwtHelper, $http, $location) {
    $scope.menu_active = "login";

    $scope.submit = function(form) {
        $http.post($scope.appconf.auth_api+"/ldap/auth", form).then(function(res) {
            toaster.success(res.data.message);
            localStorage.setItem($scope.appconf.jwt_id, res.data.jwt);
            $location.path("/main");
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }
});
//
// app.controller('ImportController', function($scope, toaster, jwtHelper, $http, $location, $routeParams, $timeout, instance)  {
//     instance.then(function(_instance) {
//         $scope.instance = _instance;
//     });
//
//     $scope.taskid = $routeParams.taskid;
//
//     /*
//     $scope.task = scaTask.get($routeParams.taskid);
//     $scope.$watchCollection('task', function(task) {
//         if(task.status == "finished") $location.path("/submit");
//     });
//     */
// });

app.controller('MainController', function($scope, toaster, $location) {
    $scope.create = function(){
        $location.path("/submit");
    };
    $scope.search = function(){
        $location.path("/search");
    };
});

app.controller("SearchController", function($scope, $http, $location, searchState) {
    $scope.keywords = searchState.keywords;
    $scope.results = null;

    $scope.search = SearchFunction;
    $scope.select = SelectFunction;

    if($scope.keywords)
    {
        $scope.search();
    }

    function SearchFunction(){
        console.debug("Searching for " + $scope.keywords);
        // TODO:  API Call to perform the search.
        $scope.results = [];

        //sample results
        $scope.results = [
            {
                "container_id": 1234,
                "name": "Container 1",
                "description": "Some Description",
                "details": "Ubuntu with Life and some other stuff",
                "data": "Neuro Data"
            },
            {
                "container_id": 5678,
                "name": "Container 2",
                "description": "Some Description",
                "details": "Ubuntu with Life and some other stuff",
                "data": "Neuro data 2"
            },
            {
                "container_id": 9012,
                "name": "Container 3",
                "description": "Some Description",
                "details": "Ubuntu with Life and some other stuff",
                "data": "MRIs"
            }
        ];
    };

    function SelectFunction(id){
        searchState.keywords = $scope.keywords;
        $location.path("/container/"+id);
    };

});

app.controller('SubmitController', function($scope, toaster, instance, $http, $routeParams, $location) {

    //JSON at the bottom of the submit page only appears if this is set to true
    $scope.DEBUG = false;

    //TODO - need to update this to ONERE specific
    //load resources that user has access
    $scope.resources = {
        onere: null, //resource to run sca-service-neuro-tracking
        upload: null,
    };
    $http.get($scope.appconf.wf_api+"/resource/best", {params: {
        service: "soichih/sca-service-onere",
    }}).then(function(res) {
        $scope.resources.onere = res.data;
        $http.get($scope.appconf.wf_api+"/resource/best", {params: {
            service: $scope.appconf.upload_task_id,
        }}).then(function(res) {
            $scope.resources.upload = res.data;
        });
    }, console.dir);

    instance.then(function(_instance) {
        $scope.instance = _instance;
        if(!$scope.instance.config) $scope.instance.config = {
            //defaults
            applications: {
                matlab: true
            }
        };

        /*
        //find all diff import
        $http.get($scope.appconf.wf_api+"/task", {params: {
            where: {
                instance_id: $routeParams.instid,
                name: "diff import",
                "products.type": "nifti",
                status: "finished",
            },
            //find last one
            sort: "-finish_date",
            //limit: 1, //find the latest one
        }})
        .then(function(res) {
            $scope.diffs = [];
            res.data.forEach(function(task) {
                task.products[0].files.forEach(function(file, idx) {
                    file.checked = true;
                    file.id = idx;
                    file.task_id = task._id;
                    $scope.diffs.push(file);
                });
            });
            if($scope.diffs.length > 0) $scope.instance.config.diff = $scope.diffs[0];
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });

        //find all .b import
        $http.get($scope.appconf.wf_api+"/task", {params: {
            where: {
                instance_id: $routeParams.instid,
                name: "b import",
                "products.type": "soichih/neuro/b",
                status: "finished",
            },
            //find the latest one
            sort: "-finish_date",
            //limit: 1,
        }})
        .then(function(res) {
            $scope.bs = [];
            res.data.forEach(function(task) {
                task.products[0].files.forEach(function(file, idx) {
                    file.checked = true;
                    file.id = idx;
                    file.task_id = task._id;
                    $scope.bs.push(file);
                });
            });
            if($scope.bs.length > 0) $scope.instance.config.b = $scope.bs[0];
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });

        //find all mask import
        $http.get($scope.appconf.wf_api+"/task", {params: {
            where: {
                instance_id: $routeParams.instid,
                name: "mask import",
                "products.type": "nifti",
                status: "finished",
            },
            //find the latest one
            sort: "-finish_date",
            //limit: 1,
        }})
        .then(function(res) {
            $scope.masks = [];
            res.data.forEach(function(task) {
                task.products[0].files.forEach(function(file, idx) {
                    file.checked = true;
                    file.id = idx;
                    file.task_id = task._id;
                    $scope.masks.push(file);
                });
            });
            if($scope.masks.length > 0) $scope.instance.config.mask = $scope.masks[0];
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
        */

    });

    $scope.submit = function() {
        var dwi = $scope.instance.config.diff;
        var b = $scope.instance.config.b;
        var mask = $scope.instance.config.mask;

        var deps = [];
        deps.push(dwi.task_id);
        deps.push(b.task_id);
        deps.push(mask.task_id);

        $http.post($scope.appconf.wf_api+"/task", {
            instance_id: $scope.instance._id,
            name: "conneval task",
            desc: $scope.instance.config.desc,
            service: "soichih/sca-service-neuro-tracking",
            config: {
                "dwi_path": "../"+dwi.task_id+"/"+dwi.filename,
                "b_path": "../"+b.task_id+"/"+b.filename,
                "mask_path": "../"+mask.task_id+"/"+mask.filename,
                "lmax": [2,4,6], //TODO
                "fibers": $scope.instance.config.fibers,
                "fibers_max": $scope.instance.config.fibers_max,
            },
            deps: deps,
        })
        .then(function(res) {
            toaster.pop("success", "Submitted a new task");
            $location.path("/task/"+res.data.task._id);
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }
});

app.controller('TaskController', function($scope, toaster, jwtHelper, $http, $window, $routeParams, $timeout, scaResource) {
    $scope.menu_active = "finished";

    $scope.taskid = $routeParams.taskid;
    $scope.jwt = localStorage.getItem($scope.appconf.jwt_id);
    $scope.activetab = 0; //raw (TODO is this still used?)

    //$scope.task = scaTask.get($routeParams.taskid);

    $scope.resource = null; //resource where this task is running/ran

    //not sure if we need this?
    $scope.$watchCollection('task', function(task) {
       //also load resource info
        if(task.resource_id && !$scope.resource) {
            $scope.resource = {}; //prevent double loading if task gets updated while waiting
            $scope.resource = scaResource.get(task.resource_id);
        }
    });

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
