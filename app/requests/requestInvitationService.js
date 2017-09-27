"use strict";

(function() {
    var app = angular.module("app");

    app.service("RequestInvitationService", function RequestInvitationService(MessageService, $http, $q) {
        var service = this;
        var REQUESTS_URI = "/api/institutions/";

        var POST = 'POST';
        var GET = 'GET';
        var PUT = 'PUT';
        var DELETE = 'DELETE';

        service.sendRequest = function sendRequest(request, institution_key) {
            return request(POST, REQUESTS_URI + institution_key + "/requests/user", request);
        };

        service.sendRequestInst = function sendRequestInst(request) {
            request.type_of_invite = "REQUEST_INSTITUTION";
            return request(POST, REQUESTS_URI + "requests/institution", request);
        };

        service.sendRequestToParentInst = function(invite, institution_requested_key) {
            return request(POST, REQUESTS_URI + institution_requested_key + "/requests/institution_parent", invite);
        };

        service.sendRequestToChildrenInst = function(invite, institution_requested_key) {
            return request(POST, REQUESTS_URI + institution_requested_key + "/requests/institution_children", invite);
        };

        service.getParentRequests = function(institution_key) {
            return request(GET, REQUESTS_URI + institution_key + "/requests/institution_parent");
        };

        service.getChildrenRequests = function(institution_key) {
            return request(GET, REQUESTS_URI + institution_key + "/requests/institution_children");
        };

        service.getRequests = function getRequests(institution_key) {
            return request(GET, REQUESTS_URI + institution_key + "/requests/user");
        };

        service.getRequestsInst = function getRequestsInst() {
            return request(GET, REQUESTS_URI + "requests/institution");
        };

        service.getRequestInst = function getRequestInst(request_key) {
            return request(GET, "/api/requests/" + request_key + "/institution");
        };

        service.getRequest = function getRequest(request_key) {
            return request(GET, "/api/requests/" + request_key + "/user");
        };

        service.acceptRequest = function acceptRequest(request_key) {
            return request(PUT, "/api/requests/" + request_key + "/user");
        };

        service.rejectRequest = function rejectRequest(request_key) {
            return request(DELETE, "/api/requests/" + request_key + "/user");
        };

        service.acceptRequestInst = function acceptRequestInst(request_key) {
            return request(PUT, "/api/requests/" + request_key + "/institution");
        };

        service.rejectRequestInst = function rejectRequest(request_key) {
            return request(DELETE, "/api/requests/" + request_key + "/institution");
        };

        service.acceptInstParentRequest = function acceptRequest(request_key) {
            return request(PUT, "/api/requests/" + request_key + "/institution_parent");
        };

        service.rejectInstParentRequest = function rejectRequest(request_key) {
            return request(DELETE, "/api/requests/" + request_key + "/institution_parent");
        };

        service.acceptInstChildrenRequest = function acceptRequest(request_key) {
            return request(PUT, "/api/requests/" + request_key + "/institution_children");
        };

        service.rejectInstChildrenRequest = function rejectRequest(request_key) {
            return request(DELETE, "/api/requests/" + request_key + "/institution_children");
        };

        function request(method, url, data) {
            var deferred = $q.defer();

            $http({
                method: method,
                url: url,
                data: data
            }).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
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