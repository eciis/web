"use strict";

const Utils = {

    /**
     * Identify all the indexes where a substring occurs inside another string
     * @param {string} substring to be searched
     * @param {string} fullString that contains the searched substring
     * @returns {[number]} a list of indexes where the substring occurs
     */
    getIndexesOf : function getIndexesOf(substring, fullString) {
        const indexes = [];
        if (substring.length !== 0) {
            let startIndex = 0, index;
            while((index = fullString.indexOf(substring, startIndex)) > -1) {
                indexes.push(index);
                startIndex = index + substring.length;
            }
        }
        return indexes;
    },

    /**
     * Limit the specified string if its size is bigger than the specified limit
     * @param {string} stringToLimit string that will be limited if necessary
     * @param {number} limit max string size
     * @returns {string} the sliced string, followed by ellipsis, or the original one
     */
    limitString : function limitString(stringToLimit, limit) {
        if(stringToLimit && stringToLimit.length > limit) {
            const undefinedIndex = -1;
            const endIndexesOfLast = this.getIndexesOf("</a>", stringToLimit);
            const indexOfLastAboveLimit = endIndexesOfLast.findIndex((index) => index >= limit);
            if(indexOfLastAboveLimit !== undefinedIndex) {
                const shiftToCloseTag = 4;
                limit = endIndexesOfLast[indexOfLastAboveLimit] + shiftToCloseTag;
            }
            return stringToLimit.substring(0, limit+1) + "...";
        } else {
            return stringToLimit;
        }
    },

    /**
     * This function indicate if the screen are in mobile device size.
     * @returns {boolean} True if the screen is smaller or equal to 960 pixels and false in otherwise.
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
