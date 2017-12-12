"use strict";

(function () {
    var app = angular.module('app');

    app.controller("RequestInvitationController", function RequestInvitationController($mdDialog, $q, MessageService, InstitutionService,
        AuthService, RequestInvitationService, $state) {
        var requestInvCtrl = this;

        requestInvCtrl.institutionSelect = {};
        requestInvCtrl.currentUser = AuthService.getCurrentUser();
        requestInvCtrl.requestsOfSelectedInst = [];
        requestInvCtrl.request = null;

        requestInvCtrl.sendRequest = function sendRequest() {
            var dataInvite = {
                institution_key : requestInvCtrl.institutionSelect.key,
                sender_key : requestInvCtrl.currentUser.key,
                admin_key : requestInvCtrl.institutionSelect.admin.key,
                is_request : true,
                type_of_invite : 'REQUEST_USER',
                sender_name : requestInvCtrl.request.name || requestInvCtrl.currentUser.name,
                office : requestInvCtrl.request.office,
                institutional_email : requestInvCtrl.request.email
            };

            var request = new Invite(dataInvite);
            var promise = RequestInvitationService.sendRequest(request, requestInvCtrl.institutionSelect.key);
            promise.then(function success() {
                $mdDialog.hide();
                MessageService.showToast("Pedido enviado com sucesso!");
            }, function error() {
                requestInvCtrl.cancelDialog();
            });
        };

        requestInvCtrl.verifyAndSendRequest = function verifyAndSendRequest() {
            if (!_.isEmpty(requestInvCtrl.requestsOfSelectedInst)) {
                const sender_keys = requestInvCtrl.requestsOfSelectedInst
                                    .filter(request => request.status === "sent")
                                    .map(request => request.sender_key);
                return !sender_keys.includes(requestInvCtrl.currentUser.key) ?
                        requestInvCtrl.sendRequest() : MessageService.showToast("Usuário já solicitou fazer parte dessa instituição.");
            } else {
                requestInvCtrl.sendRequest();
            }
        };

        (function main(){
            if(requestInvCtrl.institution) {
                requestInvCtrl.hasInstSelect = true;
                requestInvCtrl.institutionSelect = requestInvCtrl.institution;
            }
        })();

        requestInvCtrl.cancelDialog = function() {
            $mdDialog.cancel();
        };

        requestInvCtrl.cancelRequest = function cancelRequest() {
            requestInvCtrl.request = null;
        };

        requestInvCtrl.showNameInput = function showNameInput() {
            return requestInvCtrl.currentUser.name === 'Unknown' || !requestInvCtrl.currentUser.name;
        };
    });
})();