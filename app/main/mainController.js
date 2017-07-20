'use strict';
(function() {
    var app = angular.module('app');

    app.controller("MainController", function MainController($mdSidenav, $mdDialog, $mdToast, $state, AuthService, $rootScope, InstitutionService) {
        var mainCtrl = this;

        mainCtrl.search = "";
        mainCtrl.showSearchMenu = false;

        Object.defineProperty(mainCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

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

        mainCtrl.isAdmin = function isAdmin() {
            if (mainCtrl.user){
                return !_.isEmpty(mainCtrl.user.institutions_admin);
            }
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

        $rootScope.$on("user_loaded", function() {
            if (mainCtrl.user.institutions.length === 0) {
                $state.go("choose_institution");
            }

            var invite = mainCtrl.user.getPendingInvitationOf("user");
            if (mainCtrl.user.institutions.length > 0 && invite) {
                var institutionKey = invite.institution_key;
                var inviteKey = invite.key;
                $state.go("new_invite", {institutionKey: institutionKey, inviteKey: inviteKey});
            }

            if (mainCtrl.user.getPendingInvitationOf("institution")){
                $state.go("submit_institution");
            }
        });

        $rootScope.$on("user_loaded", function() {
            if (mainCtrl.user.institutions.length === 0 &&
             mainCtrl.user.invites.length === 0) {
                $state.go("user_inactive");
            }
        });
    });
})();