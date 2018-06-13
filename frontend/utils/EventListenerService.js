'use strict';

(function() {
    var app = angular.module('app');

    app.service('EventListenerService', function($rootScope) {
        let service = this;

        service.eventListener = function eventListener(event, callback){
            $rootScope.$on(event, function () {
                callback();
            });
        };

        service.multipleEventsListener = function eventListener(events, callback){
            _.forEach(events, event => {
                service.eventListener(event, callback)
            });
        };
    });
})();