"use strict";

const Utils = {
    /**
     * Replaces the original backend domain by the local one
     * @param {object} config configutarion object
     */
    updateBackendUrl : function updateBackendUrl(config) {
        const restApiUrl = Config.BACKEND_URL;

        const restApiRegex = new RegExp('^.*?/api/(.*)$');

        config.url = config.url.replace(restApiRegex, restApiUrl + '/api/$1');
    },
};
