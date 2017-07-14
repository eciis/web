'use strict';
(function() {
    var app = angular.module('app');

    app.controller("MainController", function MainController($mdSidenav, $mdDialog, $mdToast, $state, AuthService, $rootScope) {
        var mainCtrl = this;

        Object.defineProperty(mainCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        mainCtrl.toggle = function toggle() {
            $mdSidenav('leftNav').toggle();
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
        });

        $rootScope.$on("user_loaded", function() {
            if (mainCtrl.user.institutions.length === 0 &&
             mainCtrl.user.invites.length === 0) {
                $state.go("user_inactive");
            }
        });
    });
})();