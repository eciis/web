'use strict';

/*
* File used to create perfect scenario before karma tests.
*/
(function() {
    // Initialize Firebase app
    firebase.initializeApp({
        apiKey: "MOCK-API_KEY",
    });

    // Create mock of authentication
    angular.module('app').run(function (AuthService) {
        AuthService.isLoggedIn = function() {
            return true;
        };

        AuthService.getUserToken = function() {
            return "MOCK-USER-TOKEN";
        };
    });
})();