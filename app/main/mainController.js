'use strict';
(function() {
    var app = angular.module('app');

    app.controller("MainController", function MainController($mdSidenav, $mdDialog, $mdToast, $state, AuthService, InstitutionService) {
        var mainCtrl = this;
        mainCtrl.expanded = false;
        mainCtrl.institutions = [];

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

        mainCtrl.changeInstitution = function changeInstitution(name) {
            mainCtrl.user.changeInstitution(name);
        };

        mainCtrl.settings = [{
            name: 'Início',
            stateTo: 'app.home',
            icon: 'home',
            enabled: true
        }, {
            name: 'Novo Usuário',
            stateTo: 'user.new',
            icon: 'person_add',
            enabled: true
        }, ];

        mainCtrl.goTo = function goTo(state) {
            $state.go(state);
            mainCtrl.toggle();
        }; 

        mainCtrl.goToInstitution = function goToInstitution(institution) {
            $state.go('app.institution', {institutionKey: institution});
            mainCtrl.toggle();
        };       
    });
})();