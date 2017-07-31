'use strict';

/*
* File used to create perfect scenario before karma tests.
*/
(function() {
    // Initialize Firebase app
    firebase.initializeApp({
        apiKey: "MOCK-API_KEY",
    });

    var user = {
        name : 'User'
    };

    // Create mock of authentication
    angular.module('app').run(function (AuthService, UserService) {
        login(UserService, AuthService, user);
    });
})();

function login(UserService, AuthService, user) {
    var idToken = 'jdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk';

    UserService.load = function() {
        return {
            then : function(callback) {
                return callback(user);
            }
        };
    };

    AuthService.setupUser(idToken);
}