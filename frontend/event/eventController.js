'use strict';
(function() {
    var app = angular.module('app');

    app.controller("EventController", function EventController(EventService, $state, $mdDialog, AuthService, $q, STATES, SCREEN_SIZES, InstitutionService) {
        const eventCtrl = this;
        let content = document.getElementById("content");

        eventCtrl._moreEvents = true;
        eventCtrl._actualPage = 0;
        eventCtrl._isAnotherMonth = false;
        eventCtrl.events = [];
        eventCtrl.eventsByDay = [];
        eventCtrl.months = [];
        eventCtrl.years = [];
        eventCtrl.selectedMonth = null;
        eventCtrl.selectedYear = null;
        eventCtrl.user = AuthService.getCurrentUser();
        eventCtrl.isLoadingEvents = true;

        eventCtrl.loadMoreEvents = function loadMoreEvents() {

            if (eventCtrl._moreEvents) {
                const getEventsFunction = eventCtrl.institutionKey ? EventService.getInstEvents : EventService.getEvents;
                return eventCtrl._loadEvents(getEventsFunction,
                    _.get(eventCtrl.selectedMonth, 'month'),
                    eventCtrl.selectedYear);
            }
            return $q.when();
        };

        Utils.setScrollListener(content, eventCtrl.loadMoreEvents);

        /**
         * Get events from backend
         * @param {*} deferred The promise to resolve before get events from backend
         * @param {*} getEvents The function received to call and get events
         * @param {*} month The month to filter the get of events
         * @param {*} year The year to filter the get of events
         * @private
         */
        eventCtrl._loadEvents = (getEvents, month, year) => {
            return getEvents({ page: eventCtrl._actualPage, institutionKey: eventCtrl.institutionKey,
                month: month, year: year}).then(function success(response) {
                eventCtrl._actualPage += 1;
                eventCtrl._moreEvents = response.next;

                if(eventCtrl._isAnotherMonth) {
                    eventCtrl.events = response.events;
                    eventCtrl._isAnotherMonth = false;
                } else {
                    _.forEach(response.events, function(event) {
                        eventCtrl.events.push(event);
                    });
                }

                eventCtrl.isLoadingEvents = false;
                eventCtrl._getEventsByDay();
            }, function error() {
                $state.go(STATES.HOME);
            });
        }

        eventCtrl.newEvent = function newEvent(event) {
            if(Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE)) {
                $state.go(STATES.CREATE_EVENT, {
                    eventKey: null,
                    event: event,
                    events: eventCtrl.events
                });
            } else {
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
            }
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
            $state.go(STATES.EVENT_DETAILS, { eventKey: event.key });
        };

        /**
         * Get the color of institutional profile of the user
         * @param {object} event - The current event
         */
        eventCtrl.getProfileColor = (event) => {
            const profile = _.filter(eventCtrl.user.institution_profiles, function(prof) {
                return prof.institution_key === event.institution_key;
            });
            return _.get(_.first(profile), 'color', 'teal');
        };

        /**
         * Loads the events when the filters of month and/or year is changed
         */
        eventCtrl.loadFilteredEvents = () => {
            eventCtrl._moreEvents = true;
            eventCtrl._actualPage = 0;
            eventCtrl._isAnotherMonth = true;
            eventCtrl.loadMoreEvents();
        };

        /**
         * @param {date} startDate of the event which the range of days it happens will be calculated
         * @param {date} endDate of the event which the range of days it happens will be calculated
         * @returns {array} array with init day and end day in positions 0 and 1, respectively
         * @private
         */
        eventCtrl._getDaysRange = (startDate, endDate) => {
            const beginSelectedMonth = new Date(eventCtrl.selectedYear, eventCtrl.selectedMonth.month -1, 1);
            const endSelectedMonth = new Date(eventCtrl.selectedYear, eventCtrl.selectedMonth.month, 0);
            let startDay = startDate.getDate();
            let endDay = endDate.getDate();
            if (startDate < beginSelectedMonth) {
                startDay = 1;
            }
            if (endDate > endSelectedMonth) {
                endDay = endSelectedMonth.getDate();
            }
            return [startDay, endDay];
        };

        /**
         * Distributes events on days that happens
         * @param {object} event the event that be distributed
         * @param {object} eventsByDay the object with days in keys
         */
        eventCtrl._distributeEvents = (event, eventsByDay) => {
            const rangeDays = eventCtrl._getDaysRange(new Date(event.start_time), new Date(event.end_time));
            const startDay = rangeDays[0],
                   endDay = rangeDays[1];
            for (let i = startDay; i <= endDay; i++) {
                if(!eventsByDay[i])
                    eventsByDay[i] = [];
                eventsByDay[i].push(event);
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
            for (let year = 2017; year <= eventCtrl.selectedYear + 30; year++) {
                eventCtrl.years.push(year);
            }
        };

        /**
         * Loads all the months of years into objects with number and name of the month
         * @private
         */
        eventCtrl._getMonths = () => {
            return EventService.getMonths().then(function success(response) {
                eventCtrl.months = response;
                eventCtrl.selectedMonth = eventCtrl.months[new Date().getMonth()];
                eventCtrl.selectedYear = new Date().getFullYear();
                eventCtrl._loadYears();
                eventCtrl.loadMoreEvents();
            });
        };
        
        /**
         * Generate the menuItems that will live in the middle of the toolbar.
         */
        eventCtrl._getToolbarMobileMenuItems = function getToolbarMobileMenuItems() {
            const toolbarMobileMenuItems = [];

            const monthsMenuItem = {
                options: eventCtrl.months.map(month => month.month_name),
                action: month => { eventCtrl.selectedMonth = eventCtrl.months.find(m => m.month_name == month); eventCtrl.loadFilteredEvents(); },
                title: eventCtrl.selectedMonth.month_name
            };
        
            toolbarMobileMenuItems.push(monthsMenuItem);
            
            const yearsMenuItem = {
                options: eventCtrl.years,
                action: year => { eventCtrl.selectedYear = year; eventCtrl.loadFilteredEvents(); },
                title: eventCtrl.selectedYear
            };

            toolbarMobileMenuItems.push(yearsMenuItem);

            return toolbarMobileMenuItems;
        };

        /**
         * Generate the options that will be in the last
         * button of the toolbar as extra options.
         */
        eventCtrl._getToolbarMobileGeneralOptions = function getToolbarMobileGeneralOptions () {
            const toolbarMenuGeneralOptions = {};
            
            toolbarMenuGeneralOptions.options = [
                {   
                    title: 'Atualizar', action: () => { eventCtrl._moreEvents = true; 
                        eventCtrl._actualPage = 0; eventCtrl.events = []; eventCtrl.loadMoreEvents()}
                },
                {
                    title: 'Filtrar por instituição', action: () => {}
                }
            ]
            
            return toolbarMenuGeneralOptions;
        };

        /**
         * Just wraps the toolbar's items initialization
         */
        eventCtrl.setupToolbarFields = () => {
            eventCtrl.toolbarGeneralOptions = eventCtrl._getToolbarMobileGeneralOptions();
            eventCtrl.toolbarItems = eventCtrl._getToolbarMobileMenuItems();
        };

        eventCtrl.$onInit = () => {
            eventCtrl.institutionKey = $state.params.institutionKey;
            getCurrentInstitution();

            if(Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE)) {
                eventCtrl._getMonths().then(() => {
                    eventCtrl.setupToolbarFields();
                });
            } else {
                eventCtrl.loadMoreEvents();
            }
        };

        function getCurrentInstitution() {
            if (!_.isNil(eventCtrl.institutionKey)) {
                InstitutionService.getInstitution(eventCtrl.institutionKey).then((institution) => {
                    eventCtrl.institution = institution;
                });
            }
        }
    });
})();