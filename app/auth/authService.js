'use strict';

(function() {
    var app = angular.module("app");

    app.service("AuthService", function AuthService($q, $state, $firebaseAuth, $window, UserService) {
        var service = this;

        var authObj = $firebaseAuth();

        var userInfo;

        Object.defineProperty(service, 'user', {
            get: function() {
                return userInfo;
            }
        });

        service.login = function login() {
            var deferred = $q.defer();
            authObj.$signInWithPopup("google").then(function(result) {
                var userToken = {
                    accessToken : result.credential.idToken
                };

                userInfo = userToken;

                UserService.load().then(function success(userLoaded) {
                    configUser(userLoaded, userToken);
                    deferred.resolve(userInfo);
                });
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
            return userInfo.accessToken;
        };

        service.isLoggedIn = function isLoggedIn() {
            if (userInfo) {
                return true;
            }
            return false;
        };

        service.reload = function reload() {
            var deferred = $q.defer();
            UserService.load().then(function success(userLoaded) {
                var userToken = {
                    accessToken : userInfo.accessToken
                };
                configUser(userLoaded, userToken);
                deferred.resolve(userInfo);
            }, function error(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        authObj.$onAuthStateChanged(function(firebaseUser) {
            if (!firebaseUser) {
                $state.go("signin");
            }
        });

        function configUser(userLoaded, userToken) {
            userInfo = new User(userLoaded);
            _.extend(userInfo, userToken);
            $window.sessionStorage.userInfo = JSON.stringify(userInfo);
        }

        function init() {
            if ($window.sessionStorage.userInfo) {
                var parse = JSON.parse($window.sessionStorage.userInfo);
                userInfo = new User(parse);
            }
        }

        init();
    });
})();