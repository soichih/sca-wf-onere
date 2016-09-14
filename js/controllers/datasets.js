'use strict';

app.controller('DatasetsController', function($scope, toaster, $http, $timeout) {
    $scope.$parent.active_menu = "datasets";

    $scope.importing_tasks = []; //files currently imported
    $scope.selected_dataset = null; //dataset that user is viewing..
    $scope.uploading = null; //files currently uploaded

    $scope.$on("task_updated", function(evt, task) {
        $scope.importing_tasks.forEach(function(mytask) {
            if(task._id == mytask._id) {
                $scope.$apply(function() {

                    if(task.status == "finished") {
                        //reload dataset config when validation finishes
                        $http.get($scope.appconf.api+"/dataset", { params: {
                            find: JSON.stringify({_id: $scope.selected_dataset._id}),
                            select: 'config',
                        }})
                        .then(function(res) {
                            var newdataset = res.data.datasets[0];
                            $scope.selected_dataset.config = newdataset.config;
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
        $scope.selected_dataset = dataset;
        
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
        var dataset = $scope.selected_dataset;
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
        var selected_dataset = $scope.selected_dataset;
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

            /*
            file.upload = Upload.upload({
                url: $scope.appconf.wf_api+"/resource/upload/"+$scope.resources.upload._id+"/"+btoa(path), 
                fields: {
                    "Content-Type": file.type
                },
                file: file,
            });
            file.upload.then(function(res) {
                //success
                $scope.uploading = null;
                validate_and_import(selected_dataset, file.name);
            }, function(res) {
                $scope.uploading = null;
                if(res.data && res.data.message) toaster.error(res.data.message);
                else toaster.error(res.statusText);
            }, function(evt) {
                //progress
                $scope.uploading.progress = evt.loaded / evt.total;
                //console.dir(evt);
            });
            */

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
                validate_and_import(selected_dataset, file.name);
            }, false);
            xhr.send(file);

        } else {
            toaster.error("File type not allowed"); //TODO - is this the correct error scenario for this?
        }
    }

    $scope.download = function(file) {
        var path = encodeURIComponent(file.dir+"/"+file.filename);
        var jwt = localStorage.getItem($scope.appconf.jwt_id);
        console.dir($scope.resources.onere._id);
        document.location = $scope.appconf.wf_api+"/resource/download?r="+$scope.resources.onere._id+"&p="+path+"&at="+jwt;
    }

    var getAbsoluteUrl = (function() {
        var a;

        return function(url) {
            if(!a) a = document.createElement('a');
            a.href = url;

            return a.href;
        };
    })();

    function validate_and_import(dataset, filename) {
        //submit validate & import service based on file type
        $http.post($scope.appconf.wf_api+"/task", {
            instance_id: $scope.instance._id,
            name: "_importing", //important - so that I can query for all importing tasks
            service: "soichih/sca-service-onere",
            config: {
                _filename: filename, //only used for UI
                
                //I don't like that user's jwt is stored in task.. but at least it's time limited and only 
                //visible to the users themselves
                jwt: localStorage.getItem($scope.appconf.jwt_id),
                onere_api: getAbsoluteUrl($scope.appconf.api),
                import: {
                    dataset_id: dataset._id,
                    path: "../_upload/"+filename,
                }
            }
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
});

