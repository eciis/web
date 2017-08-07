'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("UserInactiveController", function UserInactiveController(AuthService, $mdDialog) {
        var userInactiveCtrl = this;

        userInactiveCtrl.user = AuthService.getCurrentUser();

        userInactiveCtrl.logout = function logout() {
            AuthService.logout();
        };

        userInactiveCtrl.resquestInvitation = function resquestInvitation(event) {
            $mdDialog.show({
                controller: "RequestInvitationController",
                controllerAs: "requestInvCtrl",
                templateUrl: 'invites/request_invitation_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        };
    });

    app.controller("RequestInvitationController", function RequestInvitationController($mdDialog, $q, MessageService, InstitutionService) {
        var requestInvCtrl = this;

        requestInvCtrl.search = "";
        requestInvCtrl.institutions = [];
        requestInvCtrl.institutionSelect = {};

        requestInvCtrl.hasInstSelect = false;
        requestInvCtrl.wasSearched = false;

        requestInvCtrl.request = function request() {
            /* TODO: Add behavior.
                    Make request invitation.
                @author: Maiana Brito 03/08/2017
            */
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
            InstitutionService.searchInstitutions(requestInvCtrl.finalSearch).then(function success(response) {
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