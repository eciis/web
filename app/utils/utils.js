"use strict";

function deepClone(initalObj, finalObj) {
    var obj = finalObj || {};
    for (var i in initalObj) {
        var prop = initalObj[i];

        if(prop === obj) {
            continue;
        }

        if (typeof prop === 'object') {
            if(prop.constructor === Array) {
                obj[i] = deepClone(prop, []);
            } else {
                obj[i] = prop;
            }
        } else {
            obj[i] = prop;
        }
    }
    return obj;
}