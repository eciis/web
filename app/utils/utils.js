"use strict";

function deepClone(initalObj, finalObj) {
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
}