'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("ChooseInstController", function ChooseInstController(InstitutionService, AuthService, UserService, $q, $timeout, $state, $mdDialog) {
        var chooseInstCtrl = this;

        chooseInstCtrl.institutions = [];

        chooseInstCtrl.selectedInstitution = null;

        Object.defineProperty(chooseInstCtrl, 'user', {
            get: function() {
                return AuthService.user;
            },
            set: function set(newValue) {
                AuthService.user = newValue;
            }
        });

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
            UserService.addInstitution(chooseInstCtrl.user, chooseInstCtrl.selectedInstitution.key)
                .then(function success(user) {
                    chooseInstCtrl.user = user;
                    showDialog(ev);
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
                    $state.go("app.home");
                });
        }
    });
})();