'use strict';

/*
* File used to create perfect scenario before karma tests.
*/
(function() {
    // Initialize Firebase app
    firebase.initializeApp({
        apiKey: "MOCK-API_KEY",
        authDomain: "eciis-splab.firebaseapp.com",           // Your Firebase Auth domain ("*.firebaseapp.com")
        databaseURL: "https://eciis-splab.firebaseio.com",   // Your Firebase Database URL ("https://*.firebaseio.com")
        storageBucket: "eciis-splab.appspot.com"
    });

    var user = {
        name : 'User'
    };

    // Create mock of authentication
    angular.module('app').run(function (AuthService, UserService) {
        var idToken = 'jdsfkbcbmnweuiyeuiwyhdjskalhdjkhjk';

        AuthService.login = function(user) {
            UserService.load = function() {
                return {
                    then : function(callback) {
                        return callback(user);
                    }
                };
            };

            AuthService.setupUser(idToken, true);
        };

        AuthService.getUserToken = () => {
            return {
                then: (callback) => callback(idToken)
            };
        }

        AuthService.login(user);

        Config.BACKEND_URL = '';
    });
})();