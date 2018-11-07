'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventController", function EventController(EventService, $state, $mdDialog, AuthService, $q) {
        var eventCtrl = this;
        var content = document.getElementById("content");

        var moreEvents = true;
        var actualPage = 0;

        eventCtrl.events = [];

        eventCtrl.user = AuthService.getCurrentUser();
        eventCtrl.isLoadingEvents = true;

        eventCtrl.loadMoreEvents = function loadMoreEvents() {

            var deferred = $q.defer();
            if (moreEvents) {
                if(eventCtrl.institutionKey) {
                    loadEvents(deferred, EventService.getInstEvents);
                } else {
                    loadEvents(deferred, EventService.getEvents);
                }
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        };

        Utils.setScrollListener(content, eventCtrl.loadMoreEvents);


        function loadEvents(deferred, getEvents) {
            getEvents(actualPage, eventCtrl.institutionKey).then(function success(response) {
                actualPage += 1;
                moreEvents = response.next;

                _.forEach(response.events, function(event) {
                    eventCtrl.events.push(event);
                });

                eventCtrl.isLoadingEvents = false;
                deferred.resolve();
            }, function error() {
                deferred.reject();
                $state.go("app.user.home");
            });
        }

        (function main() {
            eventCtrl.institutionKey = $state.params.institutionKey;
            eventCtrl.loadMoreEvents();
            eventCtrl.posts = $state.params.posts;
        })();
    });
})();