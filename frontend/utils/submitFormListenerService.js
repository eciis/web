'use strict';

(function() {
    var app = angular.module('app');

    app.service('SubmitFormListenerService', function($transitions, MessageService, $state) {
        var service = this;

        service.addListener = function addListener(obj, formElement, scope) {
            let modified = false;

            scope.$watchCollection(obj, (newObj, oldObj) => {
                modified = !angular.equals(newObj, oldObj);
            });

            let transitionListener = $transitions.onStart({
                to: () => true
            }, function(transition) {
                if (modified) {
                    transition.abort();
                    let targetState = transition._targetState;
                    let promisse = MessageService.showConfirmationDialog(
                            'event', 
                            '',
                            'Deseja sair sem salvar as alterações?');
                    
                    promisse.then(function success() {
                        modified = false;
                        $state.go(targetState._identifier, targetState._params);
                    }, function error() {
                    });
                }
            });

            formElement.onsubmit = () => {transitionListener();};
        };
    });
})();