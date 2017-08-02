'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("UserInactiveController", function UserInactiveController(AuthService, $mdDialog) {
        var userInactiveCtrl = this;

        userInactiveCtrl.user = AuthService.getCurrentUser();

        userInactiveCtrl.logout = function logout() {
            AuthService.logout();
        };

        userInactiveCtrl.resquestInvatation = function resquestInvatation(event) {
            $mdDialog.show({
                controller: "requestInvatationController",
                controllerAs: "resquestInvCtrl",
                templateUrl: 'invites/request_invantation_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                locals: {
                    user : userInactiveCtrl.user
                },
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        };
    });
    app.controller("requestInvatationController", function RequestInvatationController(user, $mdDialog, $q, MessageService, InstitutionService) {
        var resquestInvCtrl = this;

        resquestInvCtrl.user = user;
        resquestInvCtrl.search = "";
        resquestInvCtrl.institutions = [];
        resquestInvCtrl.institutionSelect = {};

        resquestInvCtrl.request = function request() {
            // ENVIAR O PEDIDO
        };

        resquestInvCtrl.cancelDialog = function() {
            $mdDialog.cancel();
        };

        resquestInvCtrl.showMenu = function showMenu() {
            var deferred = $q.defer();
            if(resquestInvCtrl.search) {
                resquestInvCtrl.finalSearch = resquestInvCtrl.search;
                resquestInvCtrl.makeSearch().then(function success() {
                    deferred.resolve(resquestInvCtrl.institutions);
                });
            }
            return deferred.promise;
        };

        resquestInvCtrl.makeSearch = function () {
            var deferred = $q.defer();
            resquestInvCtrl.institutionSelect = '';
            InstitutionService.searchInstitutions(resquestInvCtrl.finalSearch).then(function success(response) {
                resquestInvCtrl.institutions = response.data;
                if(_.size(resquestInvCtrl.institutions) === 0){
                    resquestInvCtrl.institutions.push({name: 'Nenhuma instituição encontrada'});
                }
            });
            return deferred.promise;
        };

        resquestInvCtrl.selectInstitution = function selectInstitution(institution){
            InstitutionService.getInstitution(institution.id).then(function success(response) {
                resquestInvCtrl.institutionSelect = response.data;
                resquestInvCtrl.institutionSelect.expand = true;
                resquestInvCtrl.showFullInformation(institution);
            });
        };

        resquestInvCtrl.showFullInformation = function showFullInformation(institution){
            if(resquestInvCtrl.institutionSelect.expand){
                return resquestInvCtrl.institutionSelect.key === institution.id && 
                    resquestInvCtrl.institutionSelect.expand;
                } else {
                    return false;
                }
        };
    });    
})();