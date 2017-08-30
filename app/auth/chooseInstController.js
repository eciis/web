'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("ChooseInstController", function ChooseInstController(InstitutionService, AuthService, 
            UserService, $q, $timeout, $state, $mdDialog) {
        var chooseInstCtrl = this;

        chooseInstCtrl.institutions = [];

        chooseInstCtrl.selectedInstitution = null;

        chooseInstCtrl.user = AuthService.getCurrentUser();

        chooseInstCtrl.getInstitutions = function getInstitutions() {
            var deferred = $q.defer();
            if (_.isEmpty(chooseInstCtrl.institutions)) {
                InstitutionService.getInstitutions().then(function success(response) {
                    chooseInstCtrl.institutions = response.data;
                    deferred.resolve();
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        };

        chooseInstCtrl.finish = function finish(ev) {
            UserService.addInstitution(chooseInstCtrl.user, chooseInstCtrl.selectedInstitution.key).then(
                function success() {
                    AuthService.reload().then(function success() {
                         showDialog(ev);
                    });
                });
        };

        function showDialog(ev) {
            $mdDialog.show(
                  $mdDialog.alert()
                    .clickOutsideToClose(false)
                    .title('Instituição escolhida com sucesso')
                    .ariaLabel('Instituição escolhida com sucesso')
                    .ok('Finalizar')
                    .targetEvent(ev)
                ).then(function ok() {
                    $state.go("app.config_profile");
                });
        }

        (function main() {
            if (chooseInstCtrl.user.institutions.length > 0) {
                $state.go("app.home");
            }
        })();
    });
})();