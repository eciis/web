'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventController", function EventController(EventService, $state, $mdDialog, AuthService, $q, $http) {
        var eventCtrl = this;
        var content = document.getElementById("content");

        var moreEvents = true;
        var actualPage = 0;
        var isAnotherMonth = false;

        eventCtrl.events = [];
        eventCtrl.eventsByDay = [];
        eventCtrl.months = [];
        eventCtrl.years = [];
        eventCtrl.currentMonth = null;
        eventCtrl.currentYear = null;
        eventCtrl.user = AuthService.getCurrentUser();
        eventCtrl.isLoadingEvents = true;

        eventCtrl.loadMoreEvents = function loadMoreEvents() {

            var deferred = $q.defer();
            if (moreEvents) {
                if(eventCtrl.institutionKey) {
                    loadEvents(deferred, EventService.getInstEvents, eventCtrl.currentMonth.month, eventCtrl.currentYear);
                } else {
                    loadEvents(deferred, EventService.getEvents, eventCtrl.currentMonth.month, eventCtrl.currentYear);
                }
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        };

        Utils.setScrollListener(content, eventCtrl.loadMoreEvents);


        function loadEvents(deferred, getEvents, month, year) {
            getEvents(actualPage, month, year, eventCtrl.institutionKey).then(function success(response) {
                actualPage += 1;
                moreEvents = response.next;

                if(isAnotherMonth) {
                    eventCtrl.events = response.events;
                    isAnotherMonth = false;
                } else {
                    _.forEach(response.events, function(event) {
                        eventCtrl.events.push(event);
                    });
                }

                eventCtrl.isLoadingEvents = false;
                eventCtrl._getEventsByDay();
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

        /**
         * Go to the page of a specific event
         * @param {object} event - The current event
         */
        eventCtrl.goToEvent = (event) => {
            $state.go('app.user.event', { eventKey: event.key, posts: eventCtrl.posts });
        };

        /**
         * Get the color of institutional profile of the user
         * @param {object} event - The current event
         */
        eventCtrl.getProfileColor = (event) => {
            const profile = _.filter(eventCtrl.user.institution_profiles, function(prof) {
                return prof.institution_key === event.institution_key;
            });
            if(profile.length > 0) {
                return profile[0].color;
            }
            return 'teal';
        };

        /**
         * Loads the events when the filters of month and/or year is changed
         */
        eventCtrl.loadFilteredEvents = () => {
            moreEvents = true;
            actualPage = 0;
            isAnotherMonth = true;
            eventCtrl.loadMoreEvents();
        };

        /**
         * Group the events into an array of days of the selected month of year
         * @private
         */
        eventCtrl._getEventsByDay = () => {
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

        /**
         * Loads the years 2017 to 2050 to show in filter by year
         * @private
         */
        eventCtrl._loadYears = () => {
            for (let year = 2017; year <= 2050; year++) {
                eventCtrl.years.push(year);
            }
        };

        /**
         * Loads all the months of years into objects with number and name of the month
         * @private
         */
        eventCtrl._getMonths = () => {
            $http.get('app/utils/months.json').then(function success(response) {
                eventCtrl.months = response.data;
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth();
                eventCtrl.currentMonth = eventCtrl.months[currentMonth];
                eventCtrl.currentYear = currentDate.getFullYear();
                eventCtrl._loadYears();
                eventCtrl.loadMoreEvents();
            });
        };

        (function main() {
            eventCtrl.institutionKey = $state.params.institutionKey;
            eventCtrl._getMonths();
        })();
    });
})();