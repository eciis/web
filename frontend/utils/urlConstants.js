(function () {
    'use strict';

    const MAIN_URL = "plataformacis.org";

    angular.module("app").constant('URL_CONSTANTS', {
        MAIN: MAIN_URL,
        FRONTEND: "frontend." + MAIN_URL
    });
})();