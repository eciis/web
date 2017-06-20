'use strict';

(function() {
    var app = angular.module("app");

    app.service("AuthService", function AuthService($http, $q, $rootScope) {
        var service = this;

        var LOGIN_URI = "/login";

        var LOGOUT_URI = "/logout";

        var _user;

        Object.defineProperty(service, 'user', {
            get: function get() {
                return _user;
            },
            set: function set(newValue) {
                _user = newValue;
            }
        });

        service.login = function login() {
            window.location.replace(LOGIN_URI);
        };

        service.logout = function logout() {
            window.location.replace(LOGOUT_URI);
        };

        service.load = function load() {
            var deffered = $q.defer();
            $http.get('/api/user').then(function loadUser(info) {
                service.user = new User(info.data);
                deffered.resolve(service.user);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.load().then(function success() {
            $rootScope.$broadcast("user_loaded");
        });
    });
})();