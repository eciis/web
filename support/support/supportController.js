(function() {
    'use strict';

    var support = angular.module('support');

    support.controller("SupportController", function SupportController($mdSidenav, $state,
            AuthService, $timeout, $scope) {
        var controller = this;

        controller.user = AuthService.getCurrentUser();

        controller.isAdmin = function isAdmin(keyInstitution) {
            if (controller.user && controller.user.isAdmin(keyInstitution)){
                return true;
            }
            return false;
        };

        controller.isSuperUser = function isSuperUser() {
            var current_institution_key = controller.user.current_institution.key;
            return controller.user.hasPermission('analyze_request_inst', current_institution_key);
        };

        controller.goTo = function goTo(state) {
            $state.go(state);
            controller.toggle();
        };

        controller.logout = function logout() {
            AuthService.logout();
        };

        function debounce(func, wait, context) {
            var timer;
        
            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function() {
                timer = undefined;
                func.apply(context, args);
                }, wait || 10);
            };
        }

        function buildDelayedToggler(navID) {
            return debounce(function() {
                $mdSidenav(navID).toggle();
            }, 200);
        }

        $scope.close = function () {
            $mdSidenav('left').close();
        };

        $scope.toggleLeft = buildDelayedToggler('left');
    });
})();