'use strict';

var Utils = {

    /**
     * This function indicate if the current screen size are smaller than the screen passed by parameter.
     * @param {number} the screen size that will be compared.
     * @returns {boolean} True if the screen is smaller or equal to the parameter and false in otherwise.
     */
    isMobileScreen: function isMobileScreen(mobileScreenSize) {
        if (mobileScreenSize) {
          return screen.width <= mobileScreenSize;
        }
        return screen.width <= 960;
    },
    
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