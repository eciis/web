"use strict";

(function () {
    var app = angular.module("app");

    app.controller("EventsTimelineController", function EventsTimelineController(AuthService, $mdDialog) {
        const eventsTlCtrl = this;

        eventsTlCtrl.user = AuthService.getCurrentUser();

        eventsTlCtrl.newEvent = function newEvent(event) {
            $mdDialog.show({
                controller: 'EventDialogController',
                controllerAs: "controller",
                templateUrl: 'app/event/event_dialog.html',
                targetEvent: event,
                clickOutsideToClose: true,
                locals: {
                    events: eventsTlCtrl.events
                },
                bindToController: true
            });
        };

        eventsTlCtrl.share = function share(ev, event) {
            $mdDialog.show({
                controller: "SharePostController",
                controllerAs: "sharePostCtrl",
                templateUrl: 'app/post/share_post_dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                locals: {
                    user: eventsTlCtrl.user,
                    posts: eventsTlCtrl.posts,
                    post: event,
                    addPost: true
                }
            });
        };
    });

    app.directive("eventsTimeline", function() {
        return {
            restrict: 'E',
            templateUrl: 'app/event/events_timeline.html',
            controllerAs: "eventsTlCtrl",
            controller: "EventsTimelineController",
            scope: {
                events: '=',
                posts: '='
            }
        };
    });
})();