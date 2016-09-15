'use strict';

//var host = "https://test.sca.iu.edu"; 
var host = "";

angular.module('app.config', [])
.constant('appconf', {

    debug: true,

    api: host+'/api/onere',

    shared_api: host+'/api/shared',
    shared_url: host+'/shared',

    auth_api: host+'/api/auth',
    auth_url: host+'/auth',

    wf_api: host+'/api/wf',
    sca_api: host+'/api/wf', //deprecated - but a lot of ng components still uses this!

    event_api: '/api/event',
    //profile_api: '/api/profile',

    progress_api: host+'/api/progress',
    progress_url: host+'/progress',

    jwt_id: 'jwt',

    breads: [
        {id: "workflows", label: "Workflows", url:"/wf/#/workflows" },
        {id: "submit", label: "Submit", url: "#/submit"},
        {id: "running", label: "Running", url: "#/running"},
        {id: "finished", label: "Finished", url: "#/finished"},
    ],

    upload_task_id: "_upload", //task used to store files uploaded by sca-wf-uploader
    sample_urls: [
        {
            name: "Test data from Franco. lifebid/110411/diffusion_data",
            url: "http://xd-login.opensciencegrid.org/scratch/hayashis/conneval/dwi_data_b3000_aligned_trilin.nii.gz"
        },
        {
            name: "Test data from Franco. lifebid/110411/outdir",
            url: "http://xd-login.opensciencegrid.org/scratch/hayashis/conneval/dwi_data_b3000_aligned_trilin.b"
        },
        {
            name: "Test data from Franco. lifebid/110411/anatomy",
            url: "http://xd-login.opensciencegrid.org/scratch/hayashis/conneval/wm_mask.nii.gz"
        },
    ],
    applications: [
        {
            id: "matlab",
            label: "MATLAB",
            desc: "...",
        },
        {
            id: "r",
            label: "R",
            desc: "...",
        },
        {
            id: "someapp1",
            label: "Someapp1",
            desc: "...",
        },
        {
            id: "someapp2",
            label: "Someapp2",
            desc: "...",
        }
   ]
});
