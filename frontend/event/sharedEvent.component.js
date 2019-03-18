(function() {
    'use strict';

    const app = angular.module('app');

    /**
     * Shared event mobile component
     * 
     * @example
     * <shared-event event="..."></shared-event>
     */
    app.component('sharedEvent', {
        templateUrl: 'app/event/shared_event_mobile.html',
        controller: 'EventDetailsController',
        controllerAs: 'eventDetailsCtrl',
        bindings: {
            event: '<'
        }
    });
})();