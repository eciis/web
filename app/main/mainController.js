'use strict';
(function() {
    var app = angular.module('app');

    app.controller("MainController", function MainController($mdSidenav, $mdDialog, $mdToast, $state, AuthService, $rootScope, InstitutionService) {
        var mainCtrl = this;

        mainCtrl.search = "";
        mainCtrl.user = AuthService.getCurrentUser();
        mainCtrl.showSearchMenu = false;

        mainCtrl.submit = function submit() {
            if(mainCtrl.search) {
                mainCtrl.finalSearch = mainCtrl.search;
                mainCtrl.makeSearch();
                mainCtrl.search = '';
                mainCtrl.showSearchMenu = true;
            }
            else {
                mainCtrl.showSearchMenu = false;
            }
        };

        mainCtrl.setShowSearchMenu = function setShowSearchMenu() {
            mainCtrl.showSearchMenu = false;
        };

        mainCtrl.toggle = function toggle() {
            $mdSidenav('leftNav').toggle();
        };

        mainCtrl.makeSearch = function () {
            InstitutionService.searchInstitutions(mainCtrl.finalSearch).then(function success(response) {
                mainCtrl.institutions = response.data;
            });
        };

        mainCtrl.goToSearchedInstitution = function goToSearchedInstitution(institutionId) {
            InstitutionService.getInstitution(institutionId).then(function success(response) {
                $state.go('app.institution', {institutionKey: response.data.key});
            });
        };

        mainCtrl.isActive = function isActive(inst) {
            if (mainCtrl.user.current_institution == inst) {
                return true;
            }
            return false;
        };

        mainCtrl.isAdmin = function isAdmin(current_institution) {
            if (mainCtrl.user && mainCtrl.user.isAdmin(current_institution)){
                return true;
            }
            return false;
        };

        mainCtrl.userIsActive = function userIsActive() {
            return mainCtrl.user.state == 'active';
        };

        mainCtrl.changeInstitution = function changeInstitution(name) {
            mainCtrl.user.changeInstitution(name);
        };

        mainCtrl.settings = [{
            name: 'Início',
            stateTo: 'app.home',
            icon: 'home',
            enabled: true
        }];

        mainCtrl.goTo = function goTo(state) {
            $state.go(state);
            mainCtrl.toggle();
        };

        mainCtrl.goInvite = function goInvite() {
            $state.go('app.invite_inst');
        };

        mainCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
            mainCtrl.toggle();
        };

        mainCtrl.logout = function logout() {
            AuthService.logout();
        };

        (function main() {

            var inviteOfUser = mainCtrl.user.getPendingInvitationOf("user");
            var inviteOfInstitution = mainCtrl.user.getPendingInvitationOf("institution");
            
            if (inviteOfUser) {
                var institutionKey = inviteOfUser.institution_key;
                var inviteKey = inviteOfUser.key;
                $state.go("new_invite", {institutionKey: institutionKey, inviteKey: inviteKey});
            }

            if (inviteOfInstitution) {
                var institutionStubKey = inviteOfInstitution.stub_institution_key;
                $state.go("submit_institution", {institutionKey: institutionStubKey});
            }
        })();
    });
})();