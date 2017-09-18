"use strict";

(function () {
    var app = angular.module('app');

    app.controller("RequestInvitationController", function RequestInvitationController($mdDialog, $q, MessageService, InstitutionService, AuthService, RequestInvitationService) {
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
                sender_key : requestInvCtrl.currentUser.key,
                admin_key : requestInvCtrl.institutionSelect.admin.key,
                is_request : true,
                type_of_invite : 'REQUEST_USER',
                sender_name : requestInvCtrl.user.name,
                office : requestInvCtrl.office,
                institutional_email : requestInvCtrl.email 
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
                var address = institution.address;
                var fullAddress = address.street + ", " + address.number + ", " + address.neighbourhood + 
                                 ", " + address.city + ", " + address.state + ", " + address.country;
                return fullAddress;
        };


        function clearProperties(){
            requestInvCtrl.institutionSelect = {};
            requestInvCtrl.hasInstSelect = false;
            requestInvCtrl.wasSearched = true;
        }
    });
})();