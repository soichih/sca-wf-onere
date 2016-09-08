'use strict';

app.controller('PageController', function($scope, appconf, $route, jwtHelper, $location, $http) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;
});

app.controller('DashboardController', function($scope, appconf, $route, jwtHelper, $location, $http, searchState) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;

    $scope.keywords = searchState.keywords;
    $scope.search = function(){
        searchState.keywords = $scope.keywords;
        $location.path("/results");
    };

    $scope.gotoPage = function(page){
        $location.path(page);
    };
});

app.controller('SearchResultsController', function($scope, appconf, $route, jwtHelper, $location, $http, searchState) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;

    $scope.keywords = searchState.keywords;

    $scope.results = [
        {
            "type": "service",
            "name": "LiFe Service",
            "active": true
        },
        {
            "type": "dataset",
            "name": "LiFe Data Set",
            "active": true
        },
        {
            "type": "paper",
            "name": "LiFe Paper"
        }
    ];

    $scope.search = function(){
        searchState.keywords = $scope.keywords;
        $location.path("/results");
    };

});

//submit pillars
app.controller('SubmitDatasetController', function($scope, appconf, $route, jwtHelper, $location, $http) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;
});
app.controller('SubmitServiceController', function($scope, appconf, $route, jwtHelper, $location, $http) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;
});



//View the pillars
app.controller('ViewDatasetController', function($scope, appconf, $route, jwtHelper, $location, $http) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;
});
app.controller('ViewServiceController', function($scope, appconf, $route, jwtHelper, $location, $http) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;
});
app.controller('ViewResourcesController', function($scope, appconf, $route, jwtHelper, $location, $http) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;
});
app.controller('ViewPaperController', function($scope, appconf, $route, jwtHelper, $location, $http) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;
});

//projects are a combination of datasets, services, and resources
app.controller('ViewProjectController', function($scope, appconf, $route, jwtHelper, $location, $http) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;
});
app.controller('SubmitProjectController', function($scope, appconf, $route, jwtHelper, $location, $http) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;
});


app.controller('ViewUserController', function($scope, appconf, $route, jwtHelper, $location, $http) {
    $scope.appconf = appconf;
    $scope.title = appconf.title;
});



// 'use strict';
//
//
//
//
//
//
// app.controller('PageController', function($scope, appconf, $route, jwtHelper, $location, $http) {
//     $scope.appconf = appconf;
//     $scope.title = appconf.title;
//
//     var jwt = localStorage.getItem(appconf.jwt_id);
//     if(jwt) $scope.user = jwtHelper.decodeToken(jwt);
//
//     $scope.openpage = function(page) {
//         $location.path(page);
//     }
//
//     $scope.resources = {
//         onere: null,
//         upload: null,
//     };
//
//     //load onere resource
//     $http.get($scope.appconf.wf_api+"/resource", {params: {
//         find: JSON.stringify({name: "onere"})
//     }}).then(function(res) {
//         $scope.resources.onere = res.data;
//         $http.get($scope.appconf.wf_api+"/resource/best", {params: {
//             service: $scope.appconf.upload_task_id,
//         }}).then(function(res) {
//             $scope.resources.upload = res.data;
//         });
//     }, console.dir);
// });
//
// app.controller('AboutController', function($scope, toaster) {
// });
//
// app.controller('HomeController', function($scope, toaster) {
// });
//
// app.controller('LoginController', function($scope, toaster, jwtHelper, $http, $location) {
//     $scope.menu_active = "login";
//
//     $scope.submit = function(form) {
//         $http.post($scope.appconf.auth_api+"/ldap/auth", form).then(function(res) {
//             toaster.success(res.data.message);
//             localStorage.setItem($scope.appconf.jwt_id, res.data.jwt);
//             $location.path("/main");
//         }, function(res) {
//             if(res.data && res.data.message) toaster.error(res.data.message);
//             else toaster.error(res.statusText);
//         });
//     }
// });
// //
// // app.controller('ImportController', function($scope, toaster, jwtHelper, $http, $location, $routeParams, $timeout, instance)  {
// //     instance.then(function(_instance) {
// //         $scope.instance = _instance;
// //     });
// //
// //     $scope.taskid = $routeParams.taskid;
// //
// //     /*
// //     $scope.task = scaTask.get($routeParams.taskid);
// //     $scope.$watchCollection('task', function(task) {
// //         if(task.status == "finished") $location.path("/submit");
// //     });
// //     */
// // });
//
// app.controller('MainController', function($scope, toaster, $location) {
//     $scope.create = function(){
//         $location.path("/submit");
//     };
//     $scope.search = function(){
//         $location.path("/search");
//     };
// });
//
// app.controller("SearchController", function($scope, $http, $location, searchState) {
//     $scope.keywords = searchState.keywords;
//     $scope.results = null;
//
//     $scope.search = SearchFunction;
//     $scope.select = SelectFunction;
//
//     if($scope.keywords)
//     {
//         $scope.search();
//     }
//
//     function SearchFunction(){
//         console.debug("Searching for " + $scope.keywords);
//         // TODO:  API Call to perform the search.
//         // use https://test.sca.iu.edu/onere/apidoc/#api-Application-GetApplication
//         $scope.results = [];
//
//         //sample results
//         $scope.results = [
//             {
//                 "container_id": 1234,
//                 "name": "Container 1",
//                 "description": "Some Description",
//                 "details": "Ubuntu with Life and some other stuff",
//                 "data": "Neuro Data"
//             },
//             {
//                 "container_id": 5678,
//                 "name": "Container 2",
//                 "description": "Some Description",
//                 "details": "Ubuntu with Life and some other stuff",
//                 "data": "Neuro data 2"
//             },
//             {
//                 "container_id": 9012,
//                 "name": "Container 3",
//                 "description": "Some Description",
//                 "details": "Ubuntu with Life and some other stuff",
//                 "data": "MRIs"
//             }
//         ];
//     };
//
//     function SelectFunction(id){
//         searchState.keywords = $scope.keywords;
//         $location.path("/container/"+id);
//     };
//
// });
//
// app.controller('SubmitController', function($scope, toaster, instance, $http, $routeParams, $location) {
//
//     //list of files uploaded / downloaded for dataset
//     $scope.files = [];
//
//     $scope.$on("file_uploaded", function(e, file) {
//          console.debug(e, file);
//
//          //Use sca-product-raw to save the file permanently
//          // Mostly coppied from conneval
//          $http.get($scope.appconf.wf_api+"/resource/ls/"+$scope.resources.upload.resource._id, {params: {
//              path: $scope.instance._id+"/_upload",
//          }}).then(function(res) {
//             if(!res.data.files) {
//                 toaster.error("Failed to load files uploaded");
//                 return;
//             }
//             res.data.files.forEach(function(_file) {
//                 //symlinks.push({src: "../_upload/"+file1.filename, dest: "download/"+file1.filename});
//                $scope.files.push({filename: _file.filename, src: "../_upload/"+_file.filename});
//             });
//             /*
//             $http.post($scope.appconf.wf_api+"/task", {
//                 instance_id: $scope.instance._id,
//                 name: $scope.type, //important for bvals and bvecs which doesn't have dedicated importer
//                 service: "soichih/sca-product-raw",
//                 config: {
//                     copy: symlinks,
//                 }
//             })
//             .then(function(res) {
//                //  var symlink_task = res.data.task;
//                //  do_import(symlink_task);
//                $scope.dataset.push({
//
//                });
//
//             }, function(res) {
//                 if(res.data && res.data.message) toaster.error(res.data.message);
//                 else toaster.error(res.statusText);
//             });
//             */
//          });
//
//      });
//
//     $scope.$on("file_uploaded", function(e, file) {
//          console.debug(e, file);
//
//          //Use sca-product-raw to save the file permanently
//          // Mostly coppied from conneval
//          $http.get($scope.appconf.wf_api+"/resource/ls/"+$scope.resources.upload.resource._id, {params: {
//              path: $scope.instance._id+"/_upload",
//          }}).then(function(res) {
//              if(!res.data.files) {
//                  toaster.error("Failed to load files uploaded");
//                  return;
//              }
//              var symlinks = [];
//              res.data.files.forEach(function(file1) {
//                  symlinks.push({src: "../_upload/"+file1.filename, dest: "download/"+file1.filename});
//              });
//              $http.post($scope.appconf.wf_api+"/task", {
//                  instance_id: $scope.instance._id,
//                  name: $scope.type, //important for bvals and bvecs which doesn't have dedicated importer
//                  service: "soichih/sca-product-raw",
//                  config: {
//                      copy: symlinks,
//                  }
//              })
//              .then(function(res) {
//                 //  var symlink_task = res.data.task;
//                 //  do_import(symlink_task);
//
//                 //Register with API (TODO: Lookup documentation on this)
//                 $http.post($scope.appconf.api+"/register", {
//                     instance_id: $scope.instance_id,
//                     file: file
//                 });
//
//              }, function(res) {
//                  if(res.data && res.data.message) toaster.error(res.data.message);
//                  else toaster.error(res.statusText);
//              });
//          });
//
//
//      });
//
//     instance.then(function(_instance) {
//         $scope.instance = _instance;
//         if(!$scope.instance.config) $scope.instance.config = {
//             //defaults
//             applications: {
//                 matlab: true
//             }
//         };
//
//         /*
//         //find all diff import
//         $http.get($scope.appconf.wf_api+"/task", {params: {
//             where: {
//                 instance_id: $routeParams.instid,
//                 name: "diff import",
//                 "products.type": "nifti",
//                 status: "finished",
//             },
//             //find last one
//             sort: "-finish_date",
//             //limit: 1, //find the latest one
//         }})
//         .then(function(res) {
//             $scope.diffs = [];
//             res.data.forEach(function(task) {
//                 task.products[0].files.forEach(function(file, idx) {
//                     file.checked = true;
//                     file.id = idx;
//                     file.task_id = task._id;
//                     $scope.diffs.push(file);
//                 });
//             });
//             if($scope.diffs.length > 0) $scope.instance.config.diff = $scope.diffs[0];
//         }, function(res) {
//             if(res.data && res.data.message) toaster.error(res.data.message);
//             else toaster.error(res.statusText);
//         });
//
//         //find all .b import
//         $http.get($scope.appconf.wf_api+"/task", {params: {
//             where: {
//                 instance_id: $routeParams.instid,
//                 name: "b import",
//                 "products.type": "soichih/neuro/b",
//                 status: "finished",
//             },
//             //find the latest one
//             sort: "-finish_date",
//             //limit: 1,
//         }})
//         .then(function(res) {
//             $scope.bs = [];
//             res.data.forEach(function(task) {
//                 task.products[0].files.forEach(function(file, idx) {
//                     file.checked = true;
//                     file.id = idx;
//                     file.task_id = task._id;
//                     $scope.bs.push(file);
//                 });
//             });
//             if($scope.bs.length > 0) $scope.instance.config.b = $scope.bs[0];
//         }, function(res) {
//             if(res.data && res.data.message) toaster.error(res.data.message);
//             else toaster.error(res.statusText);
//         });
//
//         //find all mask import
//         $http.get($scope.appconf.wf_api+"/task", {params: {
//             where: {
//                 instance_id: $routeParams.instid,
//                 name: "mask import",
//                 "products.type": "nifti",
//                 status: "finished",
//             },
//             //find the latest one
//             sort: "-finish_date",
//             //limit: 1,
//         }})
//         .then(function(res) {
//             $scope.masks = [];
//             res.data.forEach(function(task) {
//                 task.products[0].files.forEach(function(file, idx) {
//                     file.checked = true;
//                     file.id = idx;
//                     file.task_id = task._id;
//                     $scope.masks.push(file);
//                 });
//             });
//             if($scope.masks.length > 0) $scope.instance.config.mask = $scope.masks[0];
//         }, function(res) {
//             if(res.data && res.data.message) toaster.error(res.data.message);
//             else toaster.error(res.statusText);
//         });
//         */
//
//     });
//
//     $scope.submit = function() {
//         var dataset_path = "/N/dc2/projects/lifebid/onere/datasets";
//         //register dataset (to obtain the dataset._id)
//         $http.post($scope.appconf.api+"/dataset", {
//             name: "edit me",
//             //storage: "dc2",
//             //path: dataset_path,
//             config: {
//                 some: "info",
//             }
//         })
//         .then(function(res) {
//             var dataset = res.data;
//
//             console.log("registered dataset");
//             console.dir(dataset);
//
//             //submit task to copy input data to /N/dc2/projects/lifebid/onere/datasets
//             $scope.files.forEach(function(file) {
//                 file.dest = dataset_path+"/"+dataset._id+"/"+file.filename;
//             });
//             $http.post($scope.appconf.wf_api+"/task", {
//                 instance_id: $scope.instance._id,
//                 name: "onere dataset copy",
//                 service: "soichih/sca-product-raw",
//                 config: {
//                     copy: $scope.files
//                 }
//             })
//             .then(function(res) {
//                 var copy_task = res.data.task;
//
//                 //submited dataset copy task.. now I can submit container build task
//                 $http.post($scope.appconf.wf_api+"/task", {
//                     instance_id: $scope.instance._id,
//                     service: "soichih/sca-service-onere",
//                     name: $scope.instance.name,
//                     desc: $scope.instance.config.desc,
//                     config: {
//                         dataset_id: dataset._id,
//                         applications: $scope.instance.config.applications,
//                     },
//                     deps: [copy_task._id],
//                 })
//                 .then(function(res) {
//                     toaster.pop("success", "Submitted a container build task");
//                     $location.path("/task/"+res.data.task._id);
//                 }, function(res) {
//                     if(res.data && res.data.message) toaster.error(res.data.message);
//                     else toaster.error(res.statusText);
//                 });
//             });
//         }, function(res) {
//             if(res.data && res.data.message) toaster.error(res.data.message);
//             else toaster.error(res.statusText);
//         });
//     }
//
//     $scope.fromurl = function(url) {
//         //first submit download service
//         $http.post($scope.appconf.wf_api+"/task", {
//             instance_id: $scope.instance._id,
//             service: "soichih/sca-product-raw", //-raw service provides URL download
//             name: $scope.type,
//             config: {
//                 download: [{dir:"download", url:url}],
//             }
//         })
//         .then(function(res) {
//             var download_task = res.data.task;
//             do_import(download_task);
//         }, function(res) {
//             if(res.data && res.data.message) toaster.error(res.data.message);
//             else toaster.error(res.statusText);
//         });
//     }
// });
//
// app.controller('TaskController', function($scope, toaster, jwtHelper, $http, $window, $routeParams, $timeout, scaResource, scaTask) {
//     $scope.menu_active = "finished";
//
//     $scope.taskid = $routeParams.taskid;
//     $scope.jwt = localStorage.getItem($scope.appconf.jwt_id);
//     $scope.activetab = 0; //raw (TODO is this still used?)
//
//     //$scope.task = scaTask.get($routeParams.taskid);
//     $scope.task = scaTask.get($routeParams.taskid);
//
//     /*
//     $scope.resource = null; //resource where this task is running/ran
//     //not sure if we need this?
//     $scope.$watchCollection('task', function(task) {
//        //also load resource info
//         if(task.resource_id && !$scope.resource) {
//             $scope.resource = {}; //prevent double loading if task gets updated while waiting
//             $scope.resource = scaResource.get(task.resource_id);
//         }
//     });
//     */
//
//     $scope.back = function() {
//         $window.history.back();
//     }
// });
//
//
// //After you construct a container, this is where you can download it (or run it or whatever)
// app.controller('ContainerController', function($scope, toaster, $routeParams) {
//     var container_id = $routeParams.container_id;
//
//     //TODO: Do Ajax call here to get all the important information about the container/data
//
//     $scope.container = {
//         "container_id": container_id,
//         "name": "Some Container",
//         "description": "Some Description",
//         "details": "Ubuntu with Life and some other stuff",
//         "data": "Data description",
//         "data_location": "some location",
//         "docker_command": "some command"
//     };
//
//     $scope.download_container = function(){
//         alert("Downloading Docker Container " + $scope.container.container_id);
//     };
//     $scope.download_data = function(){
//         alert("Downloading data for " + $scope.container.container_id);
//     };
//
// });
