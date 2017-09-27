"use strict";

(function() {
    var app = angular.module("app");

    app.service("RequestInvitationService", function RequestInvitationService(MessageService, $http, $q) {
        var service = this;
        var REQUESTS_URI = "/api/institutions/";

        service.sendRequest = function sendRequest(request, institution_key) {
            return http($http.post, REQUESTS_URI + institution_key + "/requests/user", request);
        };

        service.sendRequestInst = function sendRequestInst(request) {
            request.type_of_invite = "REQUEST_INSTITUTION";
            return http($http.post, REQUESTS_URI + "requests/institution", request);
        };

        service.sendRequestToParentInst = function(invite, institution_requested_key) {
            return http($http.post, REQUESTS_URI + institution_requested_key + "/requests/institution_parent", invite);
        };

        service.sendRequestToChildrenInst = function(invite, institution_requested_key) {
            return http($http.post, REQUESTS_URI + institution_requested_key + "/requests/institution_children", invite);
        };

        service.getParentRequests = function(institution_key) {
            return http($http.get, REQUESTS_URI + institution_key + "/requests/institution_parent");
        };

        service.getChildrenRequests = function(institution_key) {
            return http($http.get, REQUESTS_URI + institution_key + "/requests/institution_children");
        };

        service.getRequests = function getRequests(institution_key) {
            return http($http.get, REQUESTS_URI + institution_key + "/requests/user");
        };

        service.getRequestsInst = function getRequestsInst() {
            return http($http.get, REQUESTS_URI + "requests/institution");
        };

        service.getRequestInst = function getRequestInst(request_key) {
            return http($http.get, "/api/requests/" + request_key + "/institution");
        };

        service.getRequest = function getRequest(request_key) {
            return http($http.get, "/api/requests/" + request_key + "/user");
        };

        service.acceptRequest = function acceptRequest(request_key) {
            return http($http.put, "/api/requests/" + request_key + "/user");
        };

        service.rejectRequest = function rejectRequest(request_key) {
            return http($http.delete, "/api/requests/" + request_key + "/user");
        };

        service.acceptRequestInst = function acceptRequestInst(request_key) {
            return http($http.put, "/api/requests/" + request_key + "/institution");
        };

        service.rejectRequestInst = function rejectRequest(request_key) {
            return http($http.delete, "/api/requests/" + request_key + "/institution");
        };

        service.acceptInstParentRequest = function acceptRequest(request_key) {
            return http($http.put, "/api/requests/" + request_key + "/institution_parent");
        };

        service.rejectInstParentRequest = function rejectRequest(request_key) {
            return http($http.delete, "/api/requests/" + request_key + "/institution_parent");
        };

        service.acceptInstChildrenRequest = function acceptRequest(request_key) {
            return http($http.put, "/api/requests/" + request_key + "/institution_children");
        };

        service.rejectInstChildrenRequest = function rejectRequest(request_key) {
            return http($http.delete, "/api/requests/" + request_key + "/institution_children");
        };

        function http(method, uri, body) {
            var deferred = $q.defer();

            method(uri, body).then(function success(response) {
                deferred.resolve(response);
            }, function erro(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        }

        service.showRejectDialog = function showRejectDialog(event) {
            var title = 'Rejeitar pedido';
            var textContent = "Ao rejeitar o pedido, o pedido será removido e não poderá ser aceito posteriormente." +
                        " Deseja rejeitar?";
            var promise = MessageService.showConfirmationDialog(event, title, textContent);
            return promise;
        };
    });
})();