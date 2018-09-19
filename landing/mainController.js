'use strict';
(function() {
    var landing = angular.module('landing');
    
    landing.controller("MainController", function MainController($state, $location, $anchorScroll, $q,
            $firebaseArray, $mdDialog, $mdSidenav, $mdMedia, $timeout) {
        var ctrl = this;

        ctrl.mdMedia = $mdMedia;
        ctrl.url_frontend = Config.FRONTEND_URL;

        var firebaseRef = firebase.database().ref();

        ctrl.user = {};

        ctrl.areas = [
            "Outros Órgãos de Governo",
            "Agência de Fomento",
            "Agência reguladora",
            "Banco Oficial",
            "Comissão",
            "Conselho",
            "Empresa privada",
            "Empresa Pública",
            "Entidade de representação",
            "Entidade sindical",
            "Fundação",
            "Indústria de equipamentos e materiais de uso em saúde",
            "Indústria farmacêutica",
            "Instituto de Pesquisa",
            "Laboratório oficial",
            "Laboratório privado",
            "Ministério",
            "Organismo Internacional",
            "Órgão de Governo Estadual",
            "Orgão de Governo Municipal",
            "Órgão vinculado a Ministério (Secretarias, Departamentos e Coordenações)",
            "Universidade"
        ];

        ctrl.toggle = function toggle() {
            $mdSidenav('leftNav').toggle();
        };

        ctrl.loadAreas = function loadAreas() {
            var deferred = $q.defer();
            deferred.resolve(ctrl.areas);
            return deferred.promise;
        };

        ctrl.processSubmition = function processSubmition(answer) {
            ctrl.user.timestamp = Date.now();
            ctrl.user.answer = answer;

            var formBase = firebaseRef.child("precadastro/");
            var firebaseArray = $firebaseArray(formBase);

            firebaseArray.$add(ctrl.user).then(function success() {
                $state.go('landing.success');
                ctrl.user = {};
            }, function error(error) {
                console.error(error);
                $state.go('landing.home');
            });
        };

        ctrl.submitForm = function submitForm(ev) {
            $mdDialog.show({
              contentElement: '#myDialog',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose: true
            });
        };

        ctrl.cancel = function() {
          $mdDialog.cancel();
        };

        ctrl.scroll = function scroll(section) {
            if ($location.path() === "/") {
                $location.hash(section);
                $anchorScroll();
            } else {
                $state.go("landing.home", {'#': section});
                $timeout(function () {
                    $location.hash(section);
                    $anchorScroll();
                }, 500);
            }
        };
    });
})();