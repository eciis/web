"use strict";

var Utils = {
    deepClone : function deepClone(initalObj, finalObj) {
        var obj = finalObj || {};
        for (var i in initalObj) {
            var prop = initalObj[i];

            if (prop !== null && typeof prop === 'object') {
                if(prop.constructor === Array) {
                    obj[i] = deepClone(prop, []);
                }
            }
            obj[i] = prop;
        }
        return obj;
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

    calculateHeight : function calculateHeight(list=[], itemHeight=5, maxRequestsNumber=4) {
        var maxHeight = itemHeight * maxRequestsNumber + 'em';
        var actualHeight = list.length * itemHeight + 'em';
        var calculedHeight = list.length < maxRequestsNumber ? actualHeight : maxHeight;
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
    }
};
