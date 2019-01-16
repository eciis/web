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

    /**
     * Extract an api path from url
     * @param {string} url that contains the api request
     * @returns the path if it exists, or the url, otherwise
     */
    getApiPath : function getApiPath(url) {
        if (_.isNil(url) || _.isNil(url.split)) {
            return url;
        }

        return '/' + url.split('/').splice(3).join('/');
    },
};
