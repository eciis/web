'use strict';

(function() {
    var app = angular.module("app");

    app.service("EventService", function EventService($http, $q) {
        var service = this;

        var EVENT_URI = "/api/events";

        service.createEvent = function createEvent(event) {
            var deferred = $q.defer();
            $http.post(EVENT_URI, event).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getEvents = function getEvents() {
            var deferred = $q.defer();
            $http.get(EVENT_URI).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.deleteEvent = function deleteEvent(event) {
            var deferred = $q.defer();
            $http.delete(EVENT_URI + '/' + event.key).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getEvent = function getEvent(eventKey) {
            var deferred = $q.defer();
            $http.get(EVENT_URI + '/' + eventKey).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.editEvent = function editEvent(eventKey, patch) {
            var deferred = $q.defer();
            $http.patch(EVENT_URI + '/' + eventKey, patch).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    });
})();