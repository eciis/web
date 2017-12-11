'use strict';

(function() {
    var app = angular.module("app");

    app.controller("UserInactiveController", function UserInactiveController(AuthService, RequestInvitationService, InstitutionService, 
                            $mdDialog, $state, $q) {
        var userInactiveCtrl = this;

        userInactiveCtrl.user = AuthService.getCurrentUser();
        userInactiveCtrl.search = "";

        userInactiveCtrl.logout = function logout() {
            AuthService.logout();
        };

        userInactiveCtrl.selectInstitution = function selectInstitution(institution){
            var deferred = $q.defer();

            InstitutionService.getInstitution(institution.id).then(function success(response) {
                userInactiveCtrl.institutionSelect = response.data;
                userInactiveCtrl.hasInstSelect = true;
                userInactiveCtrl.showFullInformation(institution);

                userInactiveCtrl.request = {
                    institution_name: institution.name
                };
                getRequests(userInactiveCtrl.institutionSelect.key);
                deferred.resolve(response);
            });
            return deferred.promise;
        };

        userInactiveCtrl.showMessage = function showMessage(){
            if(_.isEmpty(userInactiveCtrl.institutions)){
                return userInactiveCtrl.wasSearched;
            }

            return false;
        };

        userInactiveCtrl.showMenu = function showMenu() {
            var deferred = $q.defer();
            if(userInactiveCtrl.search) {
                userInactiveCtrl.finalSearch = userInactiveCtrl.search;
                userInactiveCtrl.makeSearch().then(function success() {
                    deferred.resolve(userInactiveCtrl.institutions);
                });
            }
            return deferred.promise;
        };

        userInactiveCtrl.showFullInformation = function showFullInformation(institution){
           if(!_.isEmpty(userInactiveCtrl.institutions)){
                return userInactiveCtrl.institutionSelect.key === institution.id;
            }

            return false;
        };

        userInactiveCtrl.createInst = function createInst() {
            $state.go("create_institution");
            $mdDialog.hide();
        };

        function getRequests(instKey) {
            RequestInvitationService.getRequests(instKey).then(function success(response) {
                userInactiveCtrl.requestsOfSelectedInst = response;
            }, function error() {
                //userInactiveCtrl.cancelDialog();
            });
        }

        userInactiveCtrl.makeSearch = function () {
            var deferred = $q.defer();
            clearProperties();
            InstitutionService.searchInstitutions(userInactiveCtrl.finalSearch, ACTIVE, 'institution').then(function success(response) {
                requestInvCtrl.institutions = response.data;
                deferred.resolve(response);
            });

            return deferred.promise;
        };

        function clearProperties(){
            requestInvCtrl.request = null;
            requestInvCtrl.institutionSelect = {};
            requestInvCtrl.hasInstSelect = false;
            requestInvCtrl.wasSearched = true;
        }

        userInactiveCtrl.resquestInvitation = function resquestInvitation(event) {
            $mdDialog.show({
                controller: "RequestInvitationController",
                controllerAs: "userInactiveCtrl",
                templateUrl: 'app/requests/request_invitation_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        };
    });
})();