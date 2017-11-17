"use strict";

(function () {
    var app = angular.module('app');

    app.controller("RequestInvitationController", function RequestInvitationController($mdDialog, $q, MessageService, InstitutionService,
        AuthService, RequestInvitationService, $state) {
        var requestInvCtrl = this;

        requestInvCtrl.search = "";
        requestInvCtrl.institutions = [];
        requestInvCtrl.institutionSelect = {};
        requestInvCtrl.hasInstSelect = false;
        requestInvCtrl.wasSearched = false;
        requestInvCtrl.canCreate = false;
        requestInvCtrl.currentUser = AuthService.getCurrentUser();
        requestInvCtrl.requestsOfSelectedInst = [];
        var ACTIVE = 'active';

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

        function getRequests(instKey) {
            RequestInvitationService.getRequests(instKey).then(function success(response) {
                requestInvCtrl.requestsOfSelectedInst = response;
            }, function error(response) {
                requestInvCtrl.cancelDialog();
            });
        }

        (function main(){
            if(requestInvCtrl.institution) {
                requestInvCtrl.hasInstSelect = true;
                requestInvCtrl.institutionSelect = requestInvCtrl.institution;
            }
        })();

        requestInvCtrl.createInst = function createInst() {
            $state.go("create_institution");
            $mdDialog.hide();
        };

        requestInvCtrl.cancelDialog = function() {
            $mdDialog.cancel();
        };

        requestInvCtrl.showMenu = function showMenu() {
            var deferred = $q.defer();
            if(requestInvCtrl.search) {
                requestInvCtrl.finalSearch = requestInvCtrl.search;
                requestInvCtrl.makeSearch().then(function success() {
                    deferred.resolve(requestInvCtrl.institutions);
                });
            }
            return deferred.promise;
        };

        requestInvCtrl.makeSearch = function () {
            var deferred = $q.defer();
            clearProperties();
            InstitutionService.searchInstitutions(requestInvCtrl.finalSearch, ACTIVE, 'institution').then(function success(response) {
                requestInvCtrl.institutions = response.data;
                deferred.resolve(response);
            });

            return deferred.promise;
        };

        requestInvCtrl.selectInstitution = function selectInstitution(institution){
            var deferred = $q.defer();

            InstitutionService.getInstitution(institution.id).then(function success(response) {
                requestInvCtrl.institutionSelect = response.data;
                requestInvCtrl.hasInstSelect = true;
                requestInvCtrl.showFullInformation(institution);

                requestInvCtrl.request = {
                    institution_name: institution.name
                };
                getRequests(requestInvCtrl.institutionSelect.key);
                deferred.resolve(response);
            });
            return deferred.promise;
        };

        requestInvCtrl.showFullInformation = function showFullInformation(institution){
           if(!_.isEmpty(requestInvCtrl.institutions)){
                return requestInvCtrl.institutionSelect.key === institution.id;
            }

            return false;
        };

        requestInvCtrl.showMessage = function showMessage(){
            if(_.isEmpty(requestInvCtrl.institutions)){
                return requestInvCtrl.wasSearched;
            }

            return false;
        };

        requestInvCtrl.getFullAddress = function getFullAddress(institution) {
                var instObject = new Institution(institution);
                return instObject.getFullAddress();
        };

        requestInvCtrl.cancelRequest = function cancelRequest() {
            requestInvCtrl.request = null;
        };

        requestInvCtrl.showNameInput = function showNameInput() {
            return requestInvCtrl.currentUser.name === 'Unknown' || !requestInvCtrl.currentUser.name;
        };

        function clearProperties(){
            requestInvCtrl.request = null;
            requestInvCtrl.institutionSelect = {};
            requestInvCtrl.hasInstSelect = false;
            requestInvCtrl.wasSearched = true;
        }
    });
})();