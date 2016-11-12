'use strict';

//load menu and profile by promise chaining
app.factory('menu', function(appconf, $http, jwtHelper, $sce, toaster, scaMenu) {
    console.log("menu loading");
    var jwt = localStorage.getItem(appconf.jwt_id);
    var menu = {
        header: {
        },
        top: scaMenu,
        user: null, //to-be-loaded
    };
    if(appconf.icon_url) menu.header.icon = $sce.trustAsHtml("<img src=\""+appconf.icon_url+"\">");
    if(appconf.home_url) menu.header.url = appconf.home_url
    var jwt = localStorage.getItem(appconf.jwt_id);
    if(jwt) {
        var expdate = jwtHelper.getTokenExpirationDate(jwt);
        var ttl = expdate - Date.now();
        if(ttl < 0) {
            toaster.error("Your login session has expired. Please re-sign in");
            localStorage.removeItem(appconf.jwt_id);
        } else {
            menu.user = jwtHelper.decodeToken(jwt);
            if(ttl < 3600*1000) {
                //jwt expring in less than an hour! refresh!
                console.log("jwt expiring in an hour.. refreshing first");
                $http({
                    url: appconf.auth_api+'/refresh',
                    method: 'POST'
                }).then(function(response) {
                    var jwt = response.data.jwt;
                    localStorage.setItem(appconf.jwt_id, jwt);
                    menu.user = jwtHelper.decodeToken(jwt);
                });
            }
        }
    }
    return menu;
});

app.factory('profile', function(appconf, $http) {
    var profile_cache = {};
    return {
        get: function(id) {
            if(profile_cache[id] === undefined) {
                profile_cache[id] = {};
                //$http.get(appconf.auth_api+"/profile/"+id)
                $http.get(appconf.auth_api+"/profile/"+id)
                .then(function(res) {
                    for(var key in res.data) profile_cache[id][key] = res.data[key];
                });
            }
            return profile_cache[id];
        }
    }
});

//return singleton instance or create new one if it doesn't exist yet
app.factory('instance', function(appconf, $http, jwtHelper, toaster, $q) {
    //console.log("getting test instance");
    var workflow_id = "sca-wf-onere"; //needs to match package.json/name

    var instance = null;
    return {
        get: function() {
            var deferred = $q.defer();

            //return cached one
            if(instance) {
                deferred.resolve(instance);
                return;
            }

            //get/create instancej
            $http.get(appconf.wf_api+'/instance', {
                params: {
                    find: { workflow_id: workflow_id }
                }
            })
            .then(function(res) {
                if(res.data.count != 0) {
                    //got one!
                    instance = res.data.instances[0]; 
                    console.log("reusing instance");
                    console.dir(instance);
                    deferred.resolve(instance);
                } else {
                    //need to create a new one
                    $http.post(appconf.wf_api+"/instance", {
                        workflow_id: workflow_id,
                        name: "onere instance",
                        desc: "singleton",
                        config: {some: "thing"},
                    }).then(function(res) {
                        instance = res.data;
                        console.log("created new instance");
                        console.dir(instance);
                        deferred.resolve(instance);
                    });
                }
            }, deferred.reject);
            return deferred.promise;
        }
    }
});

//save search state
app.factory('searchState', function(){
    return {
        keywords: ""
    }
});

app.factory('onere', function($http, appconf, $q) {
    return {
        //execute onere execution workflow
        execute: function(app, instance, onere_resource) {
            var deferred = $q.defer();

            console.log("executing app..");
            console.dir(app);
            
            //convert populated datasets.id back to mongo id
            var datasets = [];
            app.datasets.forEach(function(dataset) {
                if(dataset.id) return; //maybe user didn't select dataset yet
                datasets.push({name: dataset.name, id: dataset.id._id});
            });

            //find which service to run
            var service = null;
            var config = {
                _application: app, //embed application object as part of the task.
            };
            switch(app.config.type) {
            case "bash":
                service = "soichih/sca-service-bash";
                config.bash = app.config.bash;
                break;
            case "docker":
                //TODO
                service = "soichih/sca-service-docker";
                config.container = app.config.container;
                config.arguments = app.config.container_arg;
                break;
            case "dockerbuilder":
                //TODO
                service = "soichih/sca-service-dockerbuilder";
                config.dockerfile = app.config.dockerfile;
                config.arguments = app.config.container_arg;
                break;
            default:
                deferred.reject("unsupported application type:"+app.config.type);
            }
            
            //step 1.. stage the onere input dataset(s?)
            $http.post(appconf.wf_api+"/task", { 
                instance_id: instance._id,
                name: "_export", 
                service: "soichih/sca-service-onere",
                //deps: deps||[],
                config: {
                    //jwt/onere_api are not yet used by export action, but it might in the future.
                    jwt: localStorage.getItem(appconf.jwt_id),
                    onere_api: getAbsoluteUrl(appconf.api),
                    export: {
                        datasets: datasets
                    },
                },
                preferred_resource_id: onere_resource._id,
            })
            .then(function(res) {
                var export_task = res.data.task;

                /*
                //find resource where I can submit it
                console.log("looking up user resources");
                $http.get(appconf.wf_api+"/resource/best", {params: {
                    service: service,
                    resource_type: app.config.resource_type,
                }})
                .then(function(res) {
                    var resource = res.data.resource;
                    if(!res.data.resource) {
                        deferred.reject("You don't have required resource account to execute this application. Please contact SCA support");
                        return;
                    }
                    console.log("matched resources");
                    console.dir(res.data);

                    //add input paths (mainly to make it easier for the service to find the input files)
                    config.inputs = {}; 
                    app.datasets.forEach(function(dataset) {
                        config.inputs[dataset.name] = "../"+export_task._id+"/"+dataset.name;
                    });
                   
                    //finally submit appropriate sca service 
                    $http.post(appconf.wf_api+"/task", {
                        instance_id: instance._id,
                        name: "_execute", //important
                        service: service,
                        config: config,
                        preferred_resource_id: resource._id,
                        deps: [export_task._id],
                    })
                    .then(function(res) {
                        //console.log("submitted task");
                        //console.dir(res.data);
                        deferred.resolve(res.data.task);
                    });
                });
                */

                //submit dataset processing script (even if it doesn't do anything..)
                $http.post(appconf.wf_api+"/task", {
                    instance_id: instance._id,
                    name: "_preprocessing", 
                    service: "soichih/sca-service-bash",
                    config: {
                        bash: app.config.prescript||"",
                    },
                    envs: {INPUT: "../"+export_task._id},
                    deps: [export_task._id],
                })
                .then(function(res) {
                    var pre_task = res.data.task;
                    
                    //add input paths (mainly to make it easier for the service to find the input files)
                    config.inputs = {}; 
                    app.datasets.forEach(function(dataset) {
                        config.inputs[dataset.name] = "../"+export_task._id+"/"+dataset.name;
                    });
                   
                    //finally submit appropriate sca service 
                    $http.post(appconf.wf_api+"/task", {
                        instance_id: instance._id,
                        name: "_execute", //important
                        service: service,
                        config: config,
                        //preferred_resource_id: resource._id,
                        deps: [export_task._id, pre_task._id],
                        envs: {INPUT: "../"+export_task._id},
                    })
                    .then(function(res) {
                        deferred.resolve(res.data.task);
                    });
                });
            }, deferred.reject);
            return deferred.promise;
        }
    }
});
