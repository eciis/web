'use strict';
(function() {
    var landing = angular.module('landing');
    
    landing.controller("MainController", function MainController($state, $location, $anchorScroll, $q,
            $firebaseArray) {
        var ctrl = this;

        var ref = firebase.database().ref();

        ctrl.scroll = function scroll(section) {
            if ($location.path() === "/") {
                $location.hash(section);
                $anchorScroll();
            } else {
                $state.go("landing.home", {'#': section});
            }
        };

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

        ctrl.loadAreas = function loadAreas() {
            var deferred = $q.defer();
            deferred.resolve(ctrl.areas);
            return deferred.promise;
        };

        ctrl.submitForm = function submitForm(user) {
            user.timestamp = Date.now();

            var notificationsRef = ref.child("precadastro/");
            var firebaseArray = $firebaseArray(notificationsRef);

            firebaseArray.$add(user);
        };
    });
})();