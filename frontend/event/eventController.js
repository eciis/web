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

        eventCtrl.newEvent = function newEvent(event) {
            $mdDialog.show({
                controller: 'EventDialogController',
                controllerAs: "controller",
                templateUrl: 'app/event/event_dialog.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    events: eventCtrl.events
                },
                bindToController: true
            });
        };

        eventCtrl.share = function share(ev, event) {
            $mdDialog.show({
                controller: "SharePostController",
                controllerAs: "sharePostCtrl",
                templateUrl: 'app/post/share_post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    user: eventCtrl.user,
                    posts: eventCtrl.posts,
                    post: event,
                    addPost: true
                }
            });
        };

        (function main() {
            eventCtrl.institutionKey = $state.params.institutionKey;
            eventCtrl.loadMoreEvents();
            eventCtrl.posts = $state.params.posts;
        })();
    });
})();