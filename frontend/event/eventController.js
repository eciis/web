'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventController", function EventController(EventService, $state, $mdDialog, AuthService, $q, $http) {
        var eventCtrl = this;
        var content = document.getElementById("content");

        var moreEvents = true;
        var actualPage = 0;

        eventCtrl.events = [];
        eventCtrl.eventsByDay = [];
        eventCtrl.months = [];
        eventCtrl.currentMonth = null;
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
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();
            getEvents(actualPage, eventCtrl.institutionKey || currentMonth, currentYear).then(function success(response) {
                actualPage += 1;
                moreEvents = response.next;

                _.forEach(response.events, function(event) {
                    eventCtrl.events.push(event);
                });

                eventCtrl.isLoadingEvents = false;
                eventCtrl.getEventsByDay();
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
                    post: event,
                    addPost: false
                }
            });
        };

        eventCtrl.goToEvent = function(event) {
            $state.go('app.user.event', { eventKey: event.key, posts: eventCtrl.posts });
        };

        eventCtrl.getProfileColor = function(event) {
            const profile = _.filter(eventCtrl.user.institution_profiles, function(prof) {
                return prof.institution_key === event.institution_key;
            });
            if(profile.length > 0) {
                return profile[0].color;
            }
            return 'teal';
        };

        eventCtrl.getEventsByDay = function() {
            if(eventCtrl.events.length > 0) {
                eventCtrl.eventsByDay = [];
                let eventsByDay = {};
                _.forEach(eventCtrl.events, function(event) {
                    const day = new Date(event.start_time).getDate();
                    if(!eventsByDay[day]) 
                        eventsByDay[day] = [];
                    eventsByDay[day].push(event);
                });

                let days = Object.keys(eventsByDay);
                _.forEach(days, function(day) {
                    let currentValue = {
                        day: day,
                        events: eventsByDay[day]
                    };
                    eventCtrl.eventsByDay.push(currentValue);
                });
            }
        };

        function getMonths() {
            $http.get('app/utils/months.json').then(function success(response) {
                eventCtrl.months = response.data;
                const currentMonth = new Date().getMonth();
                eventCtrl.currentMonth = eventCtrl.months[currentMonth];
            });
        };

        (function main() {
            eventCtrl.institutionKey = $state.params.institutionKey;
            getMonths();
            eventCtrl.loadMoreEvents();
        })();
    });
})();