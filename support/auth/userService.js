(function() {
    'use strict';

    var support = angular.module("support");

    support.service("UserService", function UserService($http, $q) {
        var service = this;

        var USER_URI = "/api/user";

        service.load = function load() {
            var deffered = $q.defer();
            $http.get(USER_URI).then(function loadUser(info) {	
                deffered.resolve(info.data);	
            }, function error(data) {	
                deffered.reject(data);	
            });	
            return deffered.promise;
        };
    });
})();