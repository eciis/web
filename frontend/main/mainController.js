'use strict';
(function() {
    var app = angular.module('app');

    app.controller("MainController", function MainController($mdSidenav, $mdDialog, $mdToast, $state,
            AuthService, $rootScope, $q, RequestInvitationService,
            InviteService, $mdMenu) {
        var mainCtrl = this;

        mainCtrl.search_keyword = "";
        mainCtrl.user = AuthService.getCurrentUser();

        mainCtrl.pending_manager_member = 0;
        mainCtrl.pending_inst_invitations = 0;

        mainCtrl.search = function search() {
            if(mainCtrl.search_keyword) {
                var search = mainCtrl.search_keyword;
                mainCtrl.search_keyword = '';
                $state.go('app.search', {search_keyword: search});
            }
        };

        mainCtrl.toggle = function toggle() {
            $mdSidenav('leftNav').toggle();
        };

        mainCtrl.isActive = function isActive(inst) {
            if (mainCtrl.user.current_institution.key == inst.key) {
                return true;
            }
            return false;
        };

        mainCtrl.isAdmin = function isAdmin(keyInstitution) {
            if (mainCtrl.user && mainCtrl.user.isAdmin(keyInstitution)){
                return true;
            }
            return false;
        };

        mainCtrl.isSuperUser = function isSuperUser() {
            var current_institution_key = mainCtrl.user.current_institution.key;
            return mainCtrl.user.hasPermission('analyze_request_inst', current_institution_key);
        };

        mainCtrl.changeInstitution = function changeInstitution(profile) {
            mainCtrl.user.changeInstitution({'key': profile.institution_key});
            mainCtrl.getPendingTasks();
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
            $state.go('app.user.invite_inst');
        };

        mainCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
            mainCtrl.toggle();
        };

        mainCtrl.goEvents = function goEvents(){
            $state.go('app.events');
        };

        mainCtrl.logout = function logout() {
            AuthService.logout();
        };

        mainCtrl.goToManageMembers = function goToManageMembers(){
            $state.go('app.manage_institution.members', {
                institutionKey: mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.goToManageInstitutions = function goToManageInstitutions(){
            $state.go('app.manage_institution.invite_inst', {
                institutionKey: mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.goToEditInfo = function goToEditInfo(){
            $state.go('app.manage_institution.edit_info', {
                institutionKey: mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.openConfigMenu = function openConfigMenu(ev) {
            $mdMenu.open(ev);
        };

        function increaseInstInvitationsNumber(response) {
            mainCtrl.pending_inst_invitations += response.length;
        }

        mainCtrl.getPendingTasks = function getPendingTasks() {
            mainCtrl.pending_manager_member = 0;
            mainCtrl.pending_inst_invitations = 0;

            RequestInvitationService.getRequests(mainCtrl.user.current_institution.key).then(
                function success(response) {
                    mainCtrl.pending_manager_member = response.length;
                }, function error() {}
            );
            RequestInvitationService.getParentRequests(mainCtrl.user.current_institution.key).then(
                increaseInstInvitationsNumber, function error() {}
            );
            RequestInvitationService.getChildrenRequests(mainCtrl.user.current_institution.key).then(
                increaseInstInvitationsNumber, function error() {}
            );
        };

        (function main() {
            if (mainCtrl.user.name === 'Unknown') {
                $state.go("app.user.config_profile");
            }

            mainCtrl.getPendingTasks();
        })();
    });
})();