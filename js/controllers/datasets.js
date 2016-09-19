'use strict';

app.controller('DatasetsController', function($scope, toaster, $http, $timeout, $modal) {
    $scope.$parent.active_menu = "datasets";

    $scope.importing_tasks = []; //files currently imported
    $scope.selected = null; //dataset that user is viewing..
    $scope.uploading = null; //files currently uploaded

    //from https://crcns.org
    $scope.available_tags = [
        "visual-cortex", 
        "auditory-cortex", 
        "frontal-cortex",
        "prefrontal-cortex",
        "motor-cortex",
        "somatosensory-cortex",
        "orbitofrontal-cortex",
        "hippocampus",
        "thalamus",
        "retina",
        "lgn",
    ];

    $scope.$on("task_updated", function(evt, task) {
        $scope.importing_tasks.forEach(function(mytask) {
            if(task._id == mytask._id) {
                $scope.$apply(function() {

                    if(task.status == "finished") {
                        //reload dataset config when validation finishes
                        $http.get($scope.appconf.api+"/dataset", { params: {
                            find: JSON.stringify({_id: $scope.selected._id}),
                            select: 'config',
                        }})
                        .then(function(res) {
                            var newdataset = res.data.datasets[0];
                            $scope.selected.config = newdataset.config;
                        });
                    }

                    mytask.status = task.status;
                    mytask.status_msg = task.status_msg;
                    //should I copy other things? finish_date / start_date
                    //console.dir(mytask);
                });
            }
        });
    });

    //load datasets
    $http.get($scope.appconf.api+"/dataset", { params: {
        sort: '-create_date', //newer ones first
        select: 'name desc config create_date',

        //TODO - I will probably allow datasets from user's projects
        find: JSON.stringify({
            user_id: $scope.user.sub
        })
    }})
    .then(function(res) {
        $scope.datasets = res.data.datasets;
        if($scope.datasets.length > 0) {
            $scope.select_dataset($scope.datasets[0]);
        }
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });
    
    $scope.select_dataset = function(dataset) {
        console.log("selecting dataset");
        console.log(dataset);
        $scope.selected = dataset;
        
        //load importing tasks
        $http.get($scope.appconf.wf_api+"/task", {params: {
            sort: 'create_date', //older ones first
            find: JSON.stringify({
                name: "_importing", //needs to match the name when I request importing tasks
                "config.import.dataset_id": dataset._id,
            })
        }})
        .then(function(res) {
            $scope.importing_tasks = res.data.tasks;
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }
    $scope.add_dataset = function() {
        var dataset = {
            //default?
        };
        //register empty dataset
        $http.post($scope.appconf.api+"/dataset", {})
        .then(function(res) {
            var newdataset = res.data;
            $scope.datasets.unshift(newdataset);
            $scope.select_dataset(newdataset);
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }

    var save_timer;
    $scope.save_dataset = function() {
        var dataset = $scope.selected;
        if(!dataset) return; //not yet selected
        $timeout.cancel(save_timer); //clear previous timer
        save_timer = $timeout(function() {
            $http.put($scope.appconf.api+"/dataset/"+dataset._id, dataset)
            .then(function(res) {
                console.log("updated");
                console.dir(res);
                //toaster.success("Updated!");
            }, function(res) {
                if(res.data && res.data.message) toaster.error(res.data.message);
                else toaster.error(res.statusText);
            });
        }, 1000);
    }
    
    $scope.uploadFiles = function(file, errFiles) {
        var selected = $scope.selected;
        //console.log("starting file upload");
        //console.dir(file);
        //console.dir(errFiles);
        if(file) {
            $scope.uploading = {
                name: file.name,
                size: file.size,
                type: file.type,
                //lastModified: file.lastModified,
            };
            var path = $scope.instance._id+"/_upload/"+file.name;

            var xhr = new XMLHttpRequest();
            xhr.open("POST", $scope.appconf.wf_api+"/resource/upload/"+$scope.resources.upload._id+"/"+btoa(path));
            var jwt = localStorage.getItem($scope.appconf.jwt_id);
            xhr.setRequestHeader("Authorization", "Bearer "+jwt);
            //xhr.setRequestHeader("X_FILENAME", file.name);
            xhr.upload.addEventListener("progress", function(evt) {
                $scope.uploading.progress = evt.loaded / evt.total;
            }, false);
            xhr.addEventListener("load", function(evt) {
                $scope.uploading = null;
                validate_and_import(file.name, {
                    import: {
                        dataset_id: selected._id,
                        path: "../_upload/"+file.name,
                    }
                });
            }, false);
            xhr.send(file);
            $scope.uploading.progress = 0;

        } else {
            toaster.error("File type not allowed"); //TODO - is this the correct error scenario for this?
        }
    }

    $scope.download = function(file) {
        var path = encodeURIComponent(file.dir+"/"+file.filename);
        var jwt = localStorage.getItem($scope.appconf.jwt_id);
        document.location = $scope.appconf.wf_api+"/resource/download?r="+$scope.resources.onere._id+"&p="+path+"&at="+jwt;
    }

    $scope.showprogress = function(task) {
        console.dir(task);
        document.location = $scope.appconf.progress_url+"#/detail/"+task.progress_key;
    }

    //open dialog to enter URL
    $scope.start_download = function() {
        //open dialog
        var urldownload = $modal.open({
            templateUrl: "t/urldownload.modal.html",
            controllerAs: '$ctrl',
            controller: function($modalInstance) {
                var $ctrl = this;
                $ctrl.ok = function() {
                    if($ctrl.url) $modalInstance.close($ctrl.url);
                }
                $ctrl.cancel = function() {
                    $modalInstance.dismiss('cancel');
                }
            },
            //size: 'lg',
        });
        //do download
        urldownload.result.then(function(url) {
            //first use sca-product-raw service to download a file
            $http.post($scope.appconf.wf_api+"/task", { 
                instance_id: $scope.instance._id,
                name: "_downloading", 
                service: "soichih/sca-product-raw",
                config: {
                    "download": [
                        {"dir": ".", "url": url},
                    ]
                }
            })
            .then(function(res) {
                var download_task = res.data.task;
                //then submit the sca-service-onere to validate and import
                //grab filename out of url
                var split_url = url.split('/');
                var filename = split_url[split_url.length-1]; //grab the last one
                validate_and_import(filename, {
                    import: {
                        dataset_id: $scope.selected._id,
                        path: "../"+download_task._id+"/"+filename,
                    }
                }, [download_task._id]);
            }, function(res) {
                if(res.data && res.data.message) toaster.error(res.data.message);
                else toaster.error(res.statusText);
            });
        }, function() {
            //dismisses - do nothing
        });
    }

    $scope.rerun_task = function(task_id) {
        $http.put($scope.appconf.wf_api+"/task/rerun/"+task_id)
        .then(function(res) {
            toaster.success("Requested to rerun");
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }

    //submit validate & import service based on file type
    function validate_and_import(filename, config, deps) {
        //add bit more config we need
        //I don't like that user's jwt is stored in task.. but at least it's time limited and only 
        //visible to the users themselves
        config.jwt = localStorage.getItem($scope.appconf.jwt_id);
        config.onere_api = getAbsoluteUrl($scope.appconf.api);
        config._filename = filename; //only used by UI
        
        $http.post($scope.appconf.wf_api+"/task", { 
            instance_id: $scope.instance._id,
            name: "_importing", //important - so that I can query for all importing tasks
            service: "soichih/sca-service-onere",
            preferred_resource_id: $scope.resources.onere,
            deps: deps||[],
            config: config 
        })
        .then(function(res) {
            console.log("sca-product-onere service requested");
            console.dir(res.data.task);
            $scope.importing_tasks.push(res.data.task);
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }

    //TODO I need to prevent user from removeing dataset that's used by application (or cascade remove the application?)
    //TODO (delete) /dataset/:id probably doesn't remove the underline files themselves
    $scope.delete = function() {
        console.log("delete() clicked");
        if(!$scope.selected) return;

        //TODO - popup confirmation dialog first? 
        $http.delete($scope.appconf.api+"/dataset/"+$scope.selected._id)
        .then(function(res) {
            toaster.success("Successfully removed a dataset: "+$scope.selected.name);
            $scope.datasets.splice($scope.datasets.indexOf($scope.selected), 1);
            $scope.selected = null;
        }, function(res) {
            if(res.data && res.data.message) toaster.error(res.data.message);
            else toaster.error(res.statusText);
        });
    }
});

