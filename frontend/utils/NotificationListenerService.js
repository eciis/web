'use strict';

(function() {
    var app = angular.module('app');

    app.service('NotificationListenerService', function($rootScope) {
        let service = this;

        service.eventListener = function eventListener(event, callback){
            $rootScope.$on(event, function () {
                callback();
            });
        };

        service.multipleEventsListener = function eventListener(events, callback){
            events.forEach(event => {
                service.eventListener(event, callback);
            });
        };
    });
})(); 