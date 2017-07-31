'use strict';

/*
* File used to create perfect scenario before karma tests.
*/
(function() {
    // Initialize Firebase app
    firebase.initializeApp({
        apiKey: "MOCK-API_KEY",
    });

    var luiz = {
        name : 'Luiz',
        accessToken: 'jdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk'
    };

    function login(UserService, AuthService) {
        var idToken = luiz.accessToken;

        UserService.load = function() {
            return {
                then : function(callback) {
                    return callback(luiz);
                }
            };
        };

        AuthService.setupUser(idToken);
    }

    // Create mock of authentication
    angular.module('app').run(function (AuthService, UserService) {
        login(UserService, AuthService);
    });
})();