'use strict';

angular.module('app.config', [])
.constant('appconf', {

    api: 'https://test.sca.iu.edu/api/sca-wf-life',

    shared_api: 'https://test.sca.iu.edu/api/shared',
    shared_url: 'https://test.sca.iu.edu/shared',

    auth_api: 'https://test.sca.iu.edu/api/auth',
    auth_url: 'https://test.sca.iu.edu/auth',

    wf_api: 'https://test.sca.iu.edu/api/wf',
    sca_api: 'https://test.sca.iu.edu/api/wf', //deprecated - but a lot of ng components still uses this!

    progress_api: 'https://test.sca.iu.edu/api/progress',
    progress_url: 'https://test.sca.iu.edu/progress',

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
