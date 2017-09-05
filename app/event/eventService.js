'use strict';

(function() {
    var app = angular.module("app");

    app.service("EventService", function EventService($http, $q) {
        var service = this;

        service.createEvent = function createEvent(event) {
            var deferred = $q.defer();
            // ADICIONAR URL
            $http.post(event).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    });
})();