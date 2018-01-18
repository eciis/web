(function() {
    'use strict';

    var support = angular.module('support');

    support.controller("MainController", function MainController($mdSidenav, $mdDialog, $mdToast, $state,
            AuthService, $rootScope, $q, $mdMenu) {
        var mainCtrl = this;

        mainCtrl.user = AuthService.getCurrentUser();

        mainCtrl.search = function search() {
            if(mainCtrl.search_keyword) {
                var search = mainCtrl.search_keyword;
                mainCtrl.search_keyword = '';
                $state.go('app.user.search', {search_keyword: search});
            }
        };

        mainCtrl.toggle = function toggle() {
            $mdSidenav('leftNav').toggle();
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

        mainCtrl.logout = function logout() {
            AuthService.logout();
        };

        mainCtrl.goToEditInfo = function goToEditInfo(){
            $state.go('app.manage_institution.edit_info', {
                institutionKey: mainCtrl.user.current_institution.key
            });
        };

        mainCtrl.openConfigMenu = function openConfigMenu(ev) {
            $mdMenu.open(ev);
        };

        mainCtrl.resendEmailVerification = function resendEmailVerification() {
            AuthService.sendEmailVerification();
        };

        mainCtrl.userEmailVerified = function userEmailVerified() {
            return AuthService.emailVerified();
        };

        mainCtrl.refreshUser = function refreshUser() {
            AuthService.reload();
            $state.reload();
        };
    });
})();