'use strict';

var Utils = {
    /**
     * Replaces the original backend domain by the local one
     * @param {object} config configutarion object
     */
    updateBackendUrl : function updateBackendUrl(config) {
        var restApiUrl = Config.BACKEND_URL;

        var restApiRegex = new RegExp('^.*?/api/(.*)$');

        config.url = config.url.replace(restApiRegex, restApiUrl + '/api/$1');
    }
};