'use strict';
(function() {
    var app = angular.module('app');

    app.controller("AllInstitutionsController", function AllInstitutionsController(
        $state, InstitutionService, AuthService, MessageService) {
        var allInstituinsCtrl = this;

        allInstituinsCtrl.user = AuthService.getCurrentUser();

        function loadInstitutions() {
            InstitutionService.getInstitutions().then(function success(response) {
                allInstituinsCtrl.institutions = response.data;
            }, function error(response) {
                $state.go('app.user.home');
                MessageService.showToast(response.data.msg);
            });
        }

        loadInstitutions();
    });

    app.controller("InstitutionCardController", function InstitutionCardController(){
        var instituinsCardCtrl = this;
    });

    app.directive("institutionCardDetails", function () {
        return {
            restrict: 'E',
            templateUrl: "app/institution/institution_card.html",
            controllerAs: "instituinsCardCtrl",
            controller: "InstitutionCardController",
            scope: {},
            bindToController: {
                institution: '='
            }
        };
    });
})();