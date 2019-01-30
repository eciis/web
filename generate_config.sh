#!/bin/bash


config_local_list=(
    "http://localhost:8082"  #BACKEND
    "http://localhost:8080"  #LANDING
    "http://localhost:8083"  #SUPPORT
    "http://localhost:8081"  #FRONTEND
    "http://localhost:8084"  #FEATURE
);

APP_DOMAIN="development-cis.appspot.com";
config_development_list=(
    "https://backend-dot-$APP_DOMAIN"  #BACKEND
    "https://$APP_DOMAIN"              #LANDING
    "https://support-dot-$APP_DOMAIN"  #SUPPORT
    "https://frontend-dot-$APP_DOMAIN" #FRONTEND
    "https://feature-dot-$APP_DOMAIN"  #FEATURE
);

APP_DOMAIN="plataformacis.org";
config_production_list=(
    "https://backend-dot-eciis-splab.appspot.com"  #BACKEND
    "https://$APP_DOMAIN"                          #LANDING
    "https://support.$APP_DOMAIN"                  #SUPPORT
    "https://frontend.$APP_DOMAIN"                 #FRONTEND
    "https://feature.$APP_DOMAIN"                  #FEATURE
);


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


function generate_config_file {
    app_version=$2;
    config_list=();

    case $1 in
        local)
            config_list=${config_local_list[@]};
        ;;
        dev)
            config_list=${config_development_list[@]};
        ;;
        prod)
            config_list=${config_production_list[@]};
        ;;
        *)
            echo "Invalid option!";
            exit 1;
        ;;
    esac

    config_list=(
        ${config_list[@]}
        $app_version
    );
    config=$(create_config ${config_list[@]});

    for file in ${@:3} ; do
        echo "$config" > $file;
    done
}

function generate_config_file_with_urls {
    app_version=$1;
    config_list=(${@:2:5} $app_version);
    config=$(create_config ${config_list[@]});
    files=${@:7};

    echo ${config_list[@]}
    for file in ${files[@]} ; do
        echo "$config" > $file;
    done
}
