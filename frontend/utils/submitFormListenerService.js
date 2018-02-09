'use strict';

(function() {
    var app = angular.module('app');

    app.service('SubmitFormListenerService', function($transitions) {
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
                    let confirmed = confirm('Deseja sair sem salvar as alterações?');
                    if (confirmed) {
                        transitionListener();
                    } else {
                        transition.abort();
                    }
                }
            });

            formElement.onsubmit = () => {transitionListener();};
        };
    });
})();