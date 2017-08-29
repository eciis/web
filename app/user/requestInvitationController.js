"use strict";

(function () {
    var app = angular.module('app');

    app.controller("RequestInvitationController", function RequestInvitationController($mdDialog, $q, MessageService, InstitutionService, AuthService, InviteService) {
        var requestInvCtrl = this;

        requestInvCtrl.search = "";
        requestInvCtrl.institutions = [];
        requestInvCtrl.institutionSelect = {};

        requestInvCtrl.hasInstSelect = false;
        requestInvCtrl.wasSearched = false;
        requestInvCtrl.currentUser = AuthService.getCurrentUser();
        var ACTIVE = 'active';

        requestInvCtrl.request = function request() {
            var dataInvite = {
                institution_key : requestInvCtrl.institutionSelect.key,
                invitee : requestInvCtrl.currentUser.email,
                inviter_key : requestInvCtrl.institutionSelect.admin.key,
                is_request : true,
                type_of_invite : 'USER'
            };

            var invite = new Invite(dataInvite);
            var promise = InviteService.sendInvite(invite);
            promise.then(function success() {
                MessageService.showToast("Pedido enviado com sucesso!");
            });
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
            InstitutionService.searchInstitutions(requestInvCtrl.finalSearch, ACTIVE).then(function success(response) {
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
                deferred.resolve(response);
            });
            return deferred.promise;
        };

        requestInvCtrl.showFullInformation = function showFullInformation(institution){
           if(!_.isEmpty(requestInvCtrl.institutions)){
                return requestInvCtrl.institutionSelect.key === institution.id;
            } else {
                return false;
            }
        };

        requestInvCtrl.showMessage = function showMessage(){
            if(_.isEmpty(requestInvCtrl.institutions)){
                return requestInvCtrl.wasSearched;
            } else {
                return false;
            }
        };

        function clearProperties(){
            requestInvCtrl.institutionSelect = {};
            requestInvCtrl.hasInstSelect = false;
            requestInvCtrl.wasSearched = true;
        }
    });
})();