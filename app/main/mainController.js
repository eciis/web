 (function() {
    var app = angular.module('app');

    app.controller("MainController", function MainController($mdSidenav, $mdDialog, $mdToast, $state, AuthService, PostService, InstitutionService) {
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
            name: 'Nova Instituição',
            stateTo: 'app.institution',
            icon: 'account_balance',
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

        mainCtrl.newPost = function(event) {
            $mdDialog.show({
                controller: "MainController",
                controllerAs: "mainCtrl",
                templateUrl: 'main/post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        };

        getInstitutions = function(){
            InstitutionService.getInstitutions().then(function sucess(response){
                mainCtrl.institutions = response.data;
            });
        };

        mainCtrl.expand = function expand(){
            mainCtrl.expanded = true;
            if(mainCtrl.institutions.length  === 0){
                getInstitutions();
            }
        };

        mainCtrl.hide = function hide(){
            mainCtrl.expanded = false;
        };

        mainCtrl.follow = function follow(institution_key){
           InstitutionService.follow(institution_key);
                /**
                TODO: First version doesn't treat the case in which the user is already the institution follower. Decide later
                @author: Maiana Brito 01/06/2017
                **/
        };
    });
})();