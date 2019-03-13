(function() {
    'use strict';

    const app = angular.module('app');

    app.component('sharedEvent', {
        templateUrl: 'app/event/shared_event_mobile.html',
        controller: 'EventDetailsController',
        controllerAs: 'eventDetailsCtrl',
        bindings: {
            event: '<'
        }
    });
})();