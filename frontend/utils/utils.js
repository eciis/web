"use strict";

var Utils = {

    addHttpsToUrl :  function addHttpsToUrl(text, urls) {
        if(urls) {
            var http = "http://";
            for (var i = 0; i < urls.length; i++) {
                if(urls[i].slice(0, 4) !== "http") {
                    text = text.replace(urls[i], http + urls[i]);
                }
             }
        }
        return text;
    },

    getKeyFromUrl : function getKeyFromUrl(url) {
        var key = url;
        if(url.indexOf("/api/key/") != -1) {
            var splitedUrl = url.split("/api/key/");
                key = splitedUrl[1];
            }
        return key;
    },

    recognizeUrl : function recognizeUrl(text) {
        var URL_PATTERN = /(((www.)|(http(s)?:\/\/))[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
        var REPLACE_URL = "<a href=\'$1\' target='_blank'>$1</a>";
        var urlsInText = text.match(URL_PATTERN);

        text = Utils.addHttpsToUrl(text, urlsInText);
        text = text.replace(URL_PATTERN, REPLACE_URL);
        return text;
    },

    updateBackendUrl : function updateBackendUrl(config) {
        var restApiUrl = Config.BACKEND_URL;

        var restApiRegex = new RegExp('^.*?/api/(.*)$');

        config.url = config.url.replace(restApiRegex, restApiUrl + '/api/$1');
    },

    getIndexesOf : function getIndexesOf(substring, string) {
        var indexes = [];
        if (substring.length !== 0) {
            var startIndex = 0, index;
            while((index = string.indexOf(substring, startIndex)) > -1) {
                indexes.push(index);
                startIndex = index + substring.length;
            }
        }
        return indexes;
    },

    limitString : function limitString(string, limit) {
        if(string && string.length > limit) {
            var undefinedIndex = -1;
            var endIndexesOfLast = this.getIndexesOf("</a>", string);
            var indexOfLastAboveLimit = endIndexesOfLast.findIndex((index) => index >= limit);
            if(indexOfLastAboveLimit !== undefinedIndex) {
                var shiftToCloseTag = 4;
                limit = endIndexesOfLast[indexOfLastAboveLimit] + shiftToCloseTag;
            }
            return string.substring(0, limit+1) + "...";
        } else {
            return string;
        }
    },

    generateLink : function generateLink(url){
        return window.location.host + url;
    },
    
    setScrollListener: function setScrollListener(content, callback) {
        var alreadyRequested = false;
        console.log("-------------------------");

        content.onscroll = function onscroll() {

            console.log("definy onscroll");
            var screenPosition = content.scrollTop + content.offsetHeight;
            var maxHeight = content.scrollHeight;
            var proportion = screenPosition/maxHeight;
            var scrollRatio = 0.75;
        
            if (proportion >= scrollRatio && !alreadyRequested) {
                alreadyRequested = true;

                callback().then(function success() {
                    alreadyRequested = false;
                }, function error() {
                    alreadyRequested = false;
                });
            }
        };
    },

    /**
     * Verify if email is a valid email.
     * @param {string} email the email that be verified.
     * @returns {boolean} True if is a valid email or false if is invalid.
     */
    validateEmail: function validateEmail(email) {
        var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(email);
    },

    /**
     * This function return an string in normalized form, without accents and special chars.
     * @param {string} string the string that will be normalized.
     * @returns {string} The string in normalized form.
     */
    normalizeString: function normalizeString(string) {
        return string.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    },

    /**
     * This function return a boolean to indicate if a string has a word
     * bigger that screen width proportion.
     * @param {string} string that will be analized.
     * @param {number} screen width (optional).
     * @returns {boolean} True if string has a word bigger to the screen width proportion. False in otherwise.
     */
    isLargerThanTheScreen: function isLargerThanTheScreen(string, screenWidth) {
        var words = string.split(" ");
        var greatestWordLength = words
            .reduce((acumulator, word) => {
                return acumulator > word.length ? acumulator : word.length;
            }, 0);

        /* The values references to the width of screen */
        var smallScreen = 380;
        var mediumScreen = 640;
        var largeScreen = 840;
        var extraLargeScreen = 940;

        /* Max length of a word supported by screen width */
        var maxLengthWordToSmallScreen = 20;
        var maxLengthToMediumScreen = 41;
        var maxLengthToLargeScreen = 57;
        var maxLengthWordToExtraLargeScreen = 63;
        var maxLengthWordToGtExtraLargeScreen = 59;

        var screenWidth = screenWidth || screen.width;

        var supportSmallScreen = screenWidth <= smallScreen && greatestWordLength >= maxLengthWordToSmallScreen;
        var supportMediumScreen = screenWidth > smallScreen && screenWidth <= mediumScreen && greatestWordLength >= maxLengthToMediumScreen;
        var supportLargeScreen = screenWidth > mediumScreen && screenWidth <= largeScreen && greatestWordLength >= maxLengthToLargeScreen;
        var supportExtraLargeScreen = screenWidth > largeScreen && screenWidth <= extraLargeScreen && greatestWordLength >= maxLengthWordToExtraLargeScreen;
        var supportGtExtraLargeScreen = screenWidth > extraLargeScreen && greatestWordLength >= maxLengthWordToGtExtraLargeScreen

        return supportSmallScreen || supportMediumScreen || supportLargeScreen || supportExtraLargeScreen || supportExtraLargeScreen || supportGtExtraLargeScreen;
    }
};
