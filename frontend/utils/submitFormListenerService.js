'use strict';

(function() {
    var app = angular.module('app');

    app.service('SubmitFormListenerService', function($transitions, MessageService, $state) {
        var service = this;

        var listeners = {};

        service.addListener = function addListener(obj, formElement, scope) {
            var modified = false;
            var objectEquality = true;
            scope.$watch(obj, (newObj, oldObj) => {
                modified = !angular.equals(newObj, oldObj);
            }, objectEquality);

            var transitionListener = $transitions.onStart({
                to: () => true
            }, function(transition) {
                if (modified) {
                    transition.abort();
                    var targetState = transition._targetState;
                    var promisse = MessageService.showConfirmationDialog(
                            'event', 
                            '',
                            'Deseja sair sem salvar as alterações?');
                    
                    promisse.then(function success() {
                        service.unobserve(obj);
                        $state.go(targetState._identifier, targetState._params);
                    }, function error() {
                    });
                } else {
                    service.unobserve(obj);
                }
            });

            listeners[obj] = transitionListener;

            formElement.onsubmit = () => {service.unobserve(obj);};
        };

        service.unobserve = function unobserve(obj){
            let transitionListener = listeners[obj];
            transitionListener();
            delete listeners[obj];
        };
    });
})();