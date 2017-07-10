'use strict';

(function() {
    var app = angular.module("app");

    app.service("AuthService", function AuthService($q, $rootScope, $state, $firebaseAuth, $window) {
        var service = this;

        var authObj = $firebaseAuth();

        var userInfo;

        service.login = function login() {
            var deferred = $q.defer();
            authObj.$signInWithPopup("google").then(function(result) {
                var user = result.user;
                userInfo = {
                    accessToken : result.credential.idToken,
                    objectId : user.uid,
                    userName : user.email,
                    photo_url : user.photoURL
                };
                $window.sessionStorage.userInfo = JSON.stringify(userInfo);
                deferred.resolve(userInfo);
            }).catch(function(error) {
                console.error("Authentication failed:", error);
                deferred.reject(error);
            });

            return deferred.promise;
        };
        
        service.logout = function logout() {
            authObj.$signOut();
            $window.sessionStorage.userInfo = null;
            userInfo = undefined;
        };

        service.getCurrentUser = function getCurrentUser() {
            return userInfo;
        };

        service.getUserToken = function getUserToken() {
            console.log("get user token");
            return userInfo.accessToken;
        };

        service.isLoggedIn = function isLoggedIn() {
            if (authObj.$getAuth() && userInfo !== undefined) {
                console.log("Is logged in!!!");
                return true;
            }
            return false;
        };

        authObj.$onAuthStateChanged(function(firebaseUser) {
            if (!firebaseUser) {
                $state.go("signin");
            }
        });

        function init() {
            if ($window.sessionStorage.userInfo) {
                userInfo = JSON.parse($window.sessionStorage.userInfo);
            }
        }

        init();
    });
})();