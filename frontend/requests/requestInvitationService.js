"use strict";

(function() {
    var app = angular.module("app");

    app.service("RequestInvitationService", function RequestInvitationService(MessageService, HttpService) {
        var service = this;
        var INST_REQUEST_URI = "/api/institutions/";
        var REQUEST_URI = "/api/requests/";

        service.sendRequest = function sendRequest(request, institution_key) {
            var body = {data: request};
            return HttpService.post(INST_REQUEST_URI + institution_key + "/requests/user", body);
        };

        service.sendRequestInst = function sendRequestInst(request) {
            request.type_of_invite = "REQUEST_INSTITUTION";
            var body = {data: request};
            return HttpService.post(INST_REQUEST_URI + "requests/institution/", body);
        };

        service.sendRequestToParentInst = function(invite, institution_requested_key) {
            return HttpService.post(INST_REQUEST_URI + institution_requested_key + "/requests/institution_parent", invite);
        };

        service.sendRequestToChildrenInst = function(invite, institution_requested_key) {
            return HttpService.post(INST_REQUEST_URI + institution_requested_key + "/requests/institution_children", invite);
        };

        service.getParentRequests = function(institution_key) {
            return HttpService.get(INST_REQUEST_URI + institution_key + "/requests/institution_parent");
        };

        service.getChildrenRequests = function(institution_key) {
            return HttpService.get(INST_REQUEST_URI + institution_key + "/requests/institution_children");
        };

        service.getRequests = function getRequests(institution_key) {
            return HttpService.get(INST_REQUEST_URI + institution_key + "/requests/user");
        };

        service.getRequestsInst = function getRequestsInst(institution_key) {
            return HttpService.get(INST_REQUEST_URI + "requests/institution/" + institution_key);
        };

        service.getRequestInst = function getRequestInst(request_key) {
            return HttpService.get(REQUEST_URI + request_key + "/institution");
        };

        service.getRequest = function getRequest(request_key) {
            return HttpService.get(REQUEST_URI + request_key + "/user");
        };

        service.acceptRequest = function acceptRequest(request_key) {
            return HttpService.put(REQUEST_URI + request_key + "/user");
        };

        service.rejectRequest = function rejectRequest(request_key) {
            return HttpService.delete(REQUEST_URI + request_key + "/user");
        };

        service.acceptRequestInst = function acceptRequestInst(request_key) {
            return HttpService.put(REQUEST_URI + request_key + "/institution");
        };

        service.rejectRequestInst = function rejectRequest(request_key) {
            return HttpService.delete(REQUEST_URI + request_key + "/institution");
        };

        service.getInstParentRequest = function getInstParentRequest(request_key) {
            return HttpService.get(REQUEST_URI + request_key + "/institution_parent");
        };

        service.acceptInstParentRequest = function acceptRequest(request_key) {
            return HttpService.put(REQUEST_URI + request_key + "/institution_parent");
        };

        service.rejectInstParentRequest = function rejectRequest(request_key) {
            return HttpService.delete(REQUEST_URI + request_key + "/institution_parent");
        };

        service.getInstChildrenRequest = function getInstChildrenRequest(request_key) {
            return HttpService.get(REQUEST_URI + request_key + "/institution_children");
        };

        service.acceptInstChildrenRequest = function acceptRequest(request_key) {
            return HttpService.put(REQUEST_URI + request_key + "/institution_children");
        };

        service.rejectInstChildrenRequest = function rejectRequest(request_key) {
            return HttpService.delete(REQUEST_URI + request_key + "/institution_children");
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