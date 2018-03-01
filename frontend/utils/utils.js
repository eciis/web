"use strict";

var Utils = {
    clone: function clone(obj) {
        var copy;
    
        if (null == obj || "object" != typeof obj) return obj;
    
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
            }
            return copy;
        }
    
        throw new Error("Unable to copy obj! Its type isn't supported.");
    },
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

    limitString : function limitString(string, limit){
            return string && string.length > limit ?  
                string.substring(0, limit+1) + "..." : string;
    },

    /**
     * Create an object with a calculated property height, to be used with 
     * the directive ng-style on a html element that has a list of itens in it.
     * @param  {array} list=[] A list of itens.
     * @param  {number} itemHeight=5 The css estimated height of one item.
     * @param  {number} maxItensNumber=4 The max number of itens to be shown in the element per scroll.
     * @returns {object} The object with the property height.   
     */
    calculateHeight : function calculateHeight(list=[], itemHeight=5, maxItensNumber=4) {
        var maxHeight = itemHeight * maxItensNumber + 'em';
        var actualHeight = list.length * itemHeight + 'em';
        var calculedHeight = list.length < maxItensNumber ? actualHeight : maxHeight;
        return {height: calculedHeight};
    },
    
    setScrollListener: function setScrollListener(content, callback) {
        var alreadyRequested = false;

        content.onscroll = function onscroll() {
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
    }
};
