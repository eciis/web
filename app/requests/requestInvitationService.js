"use strict";

(function() {
    var app = angular.module("app");

    app.service("RequestInvitationService", function RequestInvitationService(MessageService, $http, $q, $mdDialog) {
        var service = this;
        var REQUESTS_URI = "/api/institutions/";

        service.sendRequest = function sendRequest(request, institution_key) {
            var deferred = $q.defer();

            $http.post(REQUESTS_URI + institution_key + "/requests/user", request).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        service.getRequests = function getRequests(institution_key) {
            var deferred = $q.defer();

            $http.get(REQUESTS_URI + institution_key + "/requests/user").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        service.getRequest = function getRequest(request_key) {
            var deferred = $q.defer();

            $http.get("/api/requests/" + request_key + "/user").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred. promise;
        };

        service.acceptRequest = function acceptRequest(request_key) {
            var deferred = $q.defer();

            $http.put("/api/requests/" + request_key + "/user").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred. promise;
        };

        service.rejectRequest = function rejectRequest(request_key) {
            var deferred = $q.defer();

            $http.delete("/api/requests/" + request_key + "/user").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred. promise;
        };

        service.showRejectDialog = function showRejectDialog(event) {
            var title = 'Rejeitar pedido';
            var textContent = "Ao rejeitar o pedido, o pedido será removido e não poderá ser aceito posteriormente." +
                        " Deseja rejeitar?";
            var promise = MessageService.showConfirmationDialog(event, title, textContent);
            return promise;
        };
    });
})();