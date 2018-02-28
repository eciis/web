(function() {
    'use strict';
    var app = angular.module('app');

    app.controller("AllInstitutionsController", function AllInstitutionsController(
        $state, InstitutionService, AuthService, MessageService) {
        var allInstituinsCtrl = this;
        allInstituinsCtrl.isLoadingInstitutions = true;

        allInstituinsCtrl.user = AuthService.getCurrentUser();

        function loadInstitutions() {
            InstitutionService.getInstitutions().then(function success(response) {
                allInstituinsCtrl.institutions = response.data;
                allInstituinsCtrl.isLoadingInstitutions = false;
            }, function error(response) {
                $state.go('app.user.home');
                MessageService.showToast(response.data.msg);
            });
        }

        loadInstitutions();
    }); 
})();