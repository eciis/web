'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventController", function EventController(EventService, $state, $mdDialog, AuthService, $q, $http) {
        const eventCtrl = this;
        let
            content = document.getElementById("content"),
            moreEvents = true,
            actualPage = 0,
            isAnotherMonth = false,
            currentDate, currentMonth, currentYear;

        eventCtrl.events = [];
        eventCtrl.eventsByDay = [];
        eventCtrl.months = [];
        eventCtrl.years = [];
        eventCtrl.selectedMonth = null;
        eventCtrl.selectedYear = null;
        eventCtrl.user = AuthService.getCurrentUser();
        eventCtrl.isLoadingEvents = true;

        eventCtrl.loadMoreEvents = function loadMoreEvents() {

            let deferred = $q.defer();
            if (moreEvents) {
                if(eventCtrl.institutionKey) {
                    loadEvents(deferred, EventService.getInstEvents, eventCtrl.selectedMonth && eventCtrl.selectedMonth.month,
                        eventCtrl.selectedYear);
                } else {
                    loadEvents(deferred, EventService.getEvents, eventCtrl.selectedMonth && eventCtrl.selectedMonth.month,
                        eventCtrl.selectedYear);
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
            }).then(() => {
                eventCtrl._getEventsByDay();
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
            $state.go('app.user.event', { eventKey: event.key });
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
                return _.first(profile).color;
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
         * Distributes events on days that happens 
         * @param {object} event the event that be distributed
         * @param {object} eventsByDay the object with days in keys
         */
        eventCtrl._distributeEvents = (event, eventsByDay) => {
            const daysOfCurrentMonth = new Date(eventCtrl.selectedYear, eventCtrl.selectedMonth.month, 0).getDate();
            const startMonth = new Date(event.start_time).getMonth()+1;
            const endMonth = new Date(event.end_time).getMonth()+1;
            let startDay = new Date(event.start_time).getDate();
            let endDay = new Date(event.end_time).getDate();
            if(endDay <= startDay && eventCtrl.selectedMonth.month !== endMonth) {
                endDay = daysOfCurrentMonth;
            } else if(endDay <= startDay && eventCtrl.selectedMonth.month !== startMonth) {
                startDay = 1;
            } 
            for (let i = startDay; i <= endDay; i++) {
                if(startMonth === eventCtrl.selectedMonth.month
                    || endMonth === eventCtrl.selectedMonth.month) {
                    if(!eventsByDay[i]) 
                        eventsByDay[i] = [];
                    eventsByDay[i].push(event);
                }
            }
        };

        /**
         * Group the events into an array of days of the selected month of year
         * @private
         */
        eventCtrl._getEventsByDay = () => {
            if(eventCtrl.events.length > 0 && eventCtrl.selectedMonth) {
                eventCtrl.eventsByDay = [];
                let eventsByDay = {};
                _.forEach(eventCtrl.events, function(event) {
                    eventCtrl._distributeEvents(event, eventsByDay);
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
         * Loads the year 2017 to current_year + 30 to show in filter by year
         * The year 2017 was chosen because it's the year that the project started to work
         * @private
         */
        eventCtrl._loadYears = () => {
            for (let year = 2017; year <= currentYear + 30; year++) {
                eventCtrl.years.push(year);
            }
        };

        /**
         * Loads all the months of years into objects with number and name of the month
         * @private
         */
        eventCtrl._getMonths = () => {
            EventService.getMonths().then(function success(response) {
                eventCtrl.months = response;
                eventCtrl.selectedMonth = eventCtrl.months[currentMonth];
                eventCtrl.selectedYear = currentDate.getFullYear();
                eventCtrl._loadYears();
                eventCtrl.loadMoreEvents();
            });
        };

        (function main() {
            eventCtrl.institutionKey = $state.params.institutionKey;
            if(Utils.isMobileScreen(475)) {
                currentDate = new Date();
                currentMonth = currentDate.getMonth();
                currentYear = currentDate.getFullYear();
                eventCtrl._getMonths();
            } else {
                eventCtrl.loadMoreEvents();
            }
        })();
    });
})();