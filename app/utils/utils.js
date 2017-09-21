"use strict";

var utils = {

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

        text = utils.addHttpsToUrl(text, urlsInText);
        text = text.replace(URL_PATTERN, REPLACE_URL);
        return text;
    }
};
