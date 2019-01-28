#!/bin/bash

function create_config {
    if [ $# -lt 6 ] ; then
        echo "This function requires 6 arguments!";
        exit 1;
    fi

    config="\"use strict\";

var Config = {
    BACKEND_URL: '$1',
    LANDINGPAGE_URL: '$2',
    SUPPORT_URL: '$3',
    FRONTEND_URL: '$4',
    FEATURE_URL: '$5',
    APP_VERSION: '$6'
};"

    echo "$config"
}


function create_local_config {
    config_list=(
        'http://localhost:8082'  #BACKEND
        'http://localhost:8080'  #LANDING
        'http://localhost:8083'  #SUPPORT
        'http://localhost:8081'  #FRONTEND
        'http://localhost:8084'  #FEATURE
        'refact-ecis-script'     #APP VERSION
    )
    create_config ${config_list[@]}
}
create_local_config
