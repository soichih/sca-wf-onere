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
app.factory('instance', function(appconf, $http, jwtHelper, toaster) {
    //console.log("getting test instance");
    var workflow_id = "sca-wf-onere"; //needs to match package.json/name
    return $http.get(appconf.wf_api+'/instance', {
        params: {
            find: { workflow_id: workflow_id }
        }
    })
    .then(function(res) {
        if(res.data.count != 0) {
            console.log("reusing instance");
            console.dir(res.data.instances[0]);
            return res.data.instances[0];
        } else {
            console.log("creating new instance");
            //need to create one
            return $http.post(appconf.wf_api+"/instance", {
                workflow_id: workflow_id,
                name: "onere instance",
                desc: "singleton",
                config: {some: "thing"},
            }).then(function(res) {
                console.log("created new instance");
                return res.data;
            }, function(res) {
                if(res.data && res.data.message) toaster.error(res.data.message);
                else toaster.error(res.statusText);
            });
        }
    }, function(res) {
        if(res.data && res.data.message) toaster.error(res.data.message);
        else toaster.error(res.statusText);
    });
});

//save search state
app.factory('searchState', function(){
    return {
        keywords: ""
    }
});

app.factory('onere', function($http, appconf) {
    return {
        //execute onere execution workflow
        execute: function(appdata, instance) {
            console.log("running appdata!");
            console.dir(appdata);
            
            //step 1.. stage the onere input dataset(s?)
            return $http.post(appconf.wf_api+"/task", { 
                instance_id: instance._id,
                name: "_execute", //important - so that I can query for all onere executionsj
                service: "soichih/sca-service-onere",
                //deps: deps||[],
                config: {
                }
            })
            .then(function(res) {
                var task = res.data.task;
                return task;
            }, function(res) {
                if(res.data && res.data.message) toaster.error(res.data.message);
                else toaster.error(res.statusText);
            });
        }
    }
});
