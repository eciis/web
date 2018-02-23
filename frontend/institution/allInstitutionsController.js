'use strict';
(function() {
    var app = angular.module('app');

    app.controller("AllInstitutionsController", function InviteUserController(
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
})();