'use strict';

(describe('Test EventController', function () {

    let // variables to be associated to the injected parameters
        eventCtrl, scope, httpBackend, rootScope,
        createCtrl, eventService, messageService, mdDialog, state, q;

    const // variables to create the test scenario
        institution = { name: 'Institution', key: '098745' },
        other_institution = { name: 'Other Institution', key: '75368' },
        december = 12,
        testYear = 2018,
        startDate = "2018-12-22T17:27:00Z",
        endDate = "2018-12-26T17:27:00Z",
        months = [ {month: 1}, {month: 2},
        {month: 3}, {month: 4},
        {month: 5}, {month: 6},
        {month: 7}, {month: 8},
        {month: 9}, {month: 10},
        {month: 11}, {month: 12}],
        user = {
            name: 'User',
            institutions: [institution],
            follows: [institution],
            institutions_admin: institution,
            current_institution: institution,
            institution_profiles: [{
                institution_key: institution.key,
                color: 'blue'
            }],
            key: '123'
        },
        event = {
            'title': 'Title',
            'text': 'Text',
            'local': 'Local',
            'photo_url': null,
            'start_time': startDate,
            'end_time': endDate,
            'institution_key': institution.key,
            'institution_name': institution.name,
            'last_modified_by': 'User Test',
            'key': '12345'
        },
        other_event = {
            'title': 'Other event',
            'text': 'Text',
            'local': 'Local',
            'photo_url': null,
            'start_time': startDate,
            'end_time': endDate,
            'institution_key': other_institution.key,
            'institution_name': institution.name,
            'key': '54321'
        },
        requestEvent = {
            events: [ event, other_event ],
            next: true
        },
        requestEventInst = {
            events: [ event ],
            next: true
        },
        GET_EVENTS_URI = '/api/events?page=0&limit=15',
        GET_EVENTS_INST_URI = '/api/institutions/'+institution.key+'/events?page=0&limit=5',
        GET_EVENTS_URI_WITH_FILTERS = GET_EVENTS_URI + '&month=' + new Date(startDate).getMonth() + '&year=' + new Date(startDate).getFullYear();

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, AuthService,
        $rootScope, EventService, MessageService, $mdDialog, $state, $q) {
        scope = $rootScope.$new();
        q = $q
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        eventService = EventService;
        messageService = MessageService;
        mdDialog = $mdDialog;
        state = $state;
        AuthService.login(user);

        httpBackend.when('GET', GET_EVENTS_URI || GET_EVENTS_URI_WITH_FILTERS).respond(requestEvent);
        httpBackend.when('GET', GET_EVENTS_INST_URI).respond(requestEventInst);
        httpBackend.when('GET', 'app/utils/months.json').respond(months);

        spyOn(Utils, 'setScrollListener').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback();
                }
            };
        });

        createCtrl = function(){
            return $controller('EventController', {
                scope: scope,
                $rootScope: rootScope,
                eventService: eventService,
                messageService: messageService,
                mdDialog: mdDialog
            });
        }

        eventCtrl = createCtrl();
        eventCtrl.showImage = true;
        eventCtrl.events = [];
        eventCtrl.$onInit();
    }));

    describe('onInit()', () => {

        beforeEach(() => {
            spyOn(eventCtrl, '_getMonths').and.callFake(() => {
                eventCtrl.months = months;
                eventCtrl.selectedMonth = months[0];
                return q.when();
            });
            spyOn(eventCtrl, 'loadMoreEvents');
        });

        it("Should not have an institution_key", () => {
            eventCtrl.$onInit();
            expect(eventCtrl.institutionKey).toEqual(undefined);
        });

        it("Should have an institution_key", () => {
            state.params.institutionKey = institution.key;
            eventCtrl.$onInit();
            expect(eventCtrl.institutionKey).toEqual(institution.key);
        });

        it("Should call _getMonths() if is mobile screen", () => {
            spyOn(Utils, 'isMobileScreen').and.returnValue(true);
            eventCtrl.$onInit();
            expect(eventCtrl._getMonths).toHaveBeenCalled();
            expect(eventCtrl.loadMoreEvents).not.toHaveBeenCalled();
        });

        it("Should call loadMoreEvents() if is not mobile screen", () => {
            spyOn(Utils, 'isMobileScreen').and.returnValue(false);
            eventCtrl.$onInit();
            expect(eventCtrl.loadMoreEvents).toHaveBeenCalled();
            expect(eventCtrl._getMonths).not.toHaveBeenCalled();
        });
    });

    describe('goToEvent()', () => {

        beforeEach(() => {
            spyOn(state, 'go');
        });

        it('Should call state.go', () => {
            eventCtrl.goToEvent(event);
            expect(state.go).toHaveBeenCalledWith('app.user.event', { eventKey: event.key });
        });
    });

    describe('_getEventsByDay()', () => {

        beforeEach(() => {
            eventCtrl.selectedMonth = months[11];
            eventCtrl.selectedYear = testYear;
        });

        it('Should populate the eventsByDay array', () => {
            eventCtrl.events = requestEvent.events;
            eventCtrl.$onInit();
            expect(eventCtrl.eventsByDay.length).toEqual(0);
            eventCtrl._getEventsByDay();
            expect(eventCtrl.eventsByDay.length).toEqual(5);
        });

        it('For same month: should have days 22 to 26', () => {
            eventCtrl.events = requestEvent.events;
            eventCtrl.$onInit();
            expect(eventCtrl.eventsByDay).toEqual([]);
            eventCtrl._getEventsByDay();
            expect(eventCtrl.eventsByDay.map(obj => obj.day))
                .toEqual(['22', '23', '24', '25', '26']);
        });

        it('For start in a earlier month: should have days 1 to 5', () => {
            eventCtrl.events = [{
                'start_time': "2018-11-22T17:27:00Z",
                'end_time': "2018-12-05T17:27:00Z"
            }];
            eventCtrl.$onInit();
            expect(eventCtrl.eventsByDay).toEqual([]);
            eventCtrl._getEventsByDay();
            expect(eventCtrl.eventsByDay.map(obj => obj.day))
                .toEqual(['1', '2', '3', '4', '5']);
        });

        it('For end in a later month: should have days 26 to 31', () => {
            eventCtrl.events = [{
                'start_time': "2018-12-26T17:27:00Z",
                'end_time': "2019-01-15T17:27:00Z"
            }];
            eventCtrl.$onInit();
            expect(eventCtrl.eventsByDay).toEqual([]);
            eventCtrl._getEventsByDay();
            expect(eventCtrl.eventsByDay.map(obj => obj.day))
                .toEqual(['26', '27', '28', '29', '30', '31']);
        });

        it('For start and end in months different from selected: should have days 1 to 31', () => {
            eventCtrl.events = [{
                'start_time': "2018-11-26T17:27:00Z",
                'end_time': "2019-01-15T17:27:00Z"
            }];
            eventCtrl.$onInit();
            expect(eventCtrl.eventsByDay).toEqual([]);
            eventCtrl._getEventsByDay();
            expect(eventCtrl.eventsByDay.map(obj => obj.day))
                .toEqual(['1', '2', '3', '4', '5',
                '6', '7', '8', '9', '10', '11',
                '12', '13', '14', '15', '16',
                '17', '18', '19', '20', '21',
                '22', '23', '24', '25', '26',
                '27', '28', '29', '30', '31']);
        });
    });

    describe('getMonths()', () => {

        beforeEach(() => {
            spyOn(eventService, 'getMonths').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback(months);
                    }
                };
            });
            spyOn(eventCtrl, '_loadYears');
            spyOn(eventCtrl, 'loadMoreEvents');
        });

        it('Should call _loadYears', () => {
            eventCtrl._getMonths();
            expect(eventCtrl._loadYears).toHaveBeenCalled();
        });

        it('Should call loadMoreEvents', () => {
            eventCtrl._getMonths();
            expect(eventCtrl.loadMoreEvents).toHaveBeenCalled();
        });

        it('Should has 12 months loaded', () => {
            eventCtrl._getMonths();
            expect(eventCtrl.months).toEqual(months);
            expect(eventCtrl.months.length).toEqual(12);
        });

        it("The selectedMonth and selectedYear should equal to the current month and year", () => {
            const currentDate = new Date();
            eventCtrl._getMonths();
            expect(eventCtrl.selectedMonth).toEqual({month: currentDate.getMonth()+1});
            expect(eventCtrl.selectedYear).toEqual(currentDate.getFullYear());
        });
    });

    describe('_getDaysRange()', () => {

        it('Should return array with init day and end day in positions 0 and 1, respectively', () => {
            eventCtrl.selectedMonth = months[11].month;
            eventCtrl.selectedYear = new Date(startDate).getFullYear();
            expect(eventCtrl._getDaysRange(new Date(startDate), new Date(endDate)))
                .toEqual([22, 26]);
        });
    });

    describe('loadFilteredEvents()', () => {

        it('Should reset moreEvents, actualPage and isAnotherMonth', () => {
            eventCtrl._moreEvents = false;
            eventCtrl._actualPage = 5;
            eventCtrl._isAnotherMonth = false;
            eventCtrl.loadFilteredEvents();
            expect(eventCtrl._moreEvents).toBeTruthy();
            expect(eventCtrl._actualPage).toEqual(0);
            expect(eventCtrl._isAnotherMonth).toBeTruthy();
        });

        it('Should call loadMoreEvents()', () => {
            spyOn(eventCtrl, 'loadMoreEvents');
            eventCtrl.loadFilteredEvents();
            expect(eventCtrl.loadMoreEvents).toHaveBeenCalled();
        });
    });

    describe('loadMoreEvents()', () => {

        beforeEach(() => {
            eventCtrl._moreEvents = true;
            eventCtrl.selectedMonth = months[11];
            eventCtrl.selectedYear = testYear;
        });

        it('Should call _loadEvents', () => {
            spyOn(eventCtrl, '_loadEvents');
            eventCtrl.loadMoreEvents();
            expect(eventCtrl._loadEvents).toHaveBeenCalled();
        });

        it('Should call _loadEvents with eventService.getEvents when key is null', () => {
            spyOn(eventCtrl, '_loadEvents');
            const params = {
                page: eventCtrl._actualPage, month: december, year: testYear 
            }
            eventCtrl.institutionKey = null;
            eventCtrl.loadMoreEvents();
            expect(eventCtrl._loadEvents)
                .toHaveBeenCalledWith(eventService.getEvents, params);
        });

        it("Should call _loadEvents with eventService.getEvents when key isn't null", () => {
            spyOn(eventCtrl, '_loadEvents');
            eventCtrl.institutionKey = institution.key;
            const params = {
                page: eventCtrl._actualPage, institutionKey: eventCtrl.institutionKey
            }
            eventCtrl.loadMoreEvents();
            expect(eventCtrl._loadEvents)
                .toHaveBeenCalledWith(eventService.getInstEvents, params);
        });
    });

    describe('_loadEvents()', () => {

        beforeEach(() => {
            spyOn(eventService, 'getEvents').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({events: requestEvent.events, next: true});
                    }
                };
            });
        });

        it('Should call eventService.getEvents()', () => {
            eventCtrl._loadEvents(eventService.getEvents, december, testYear);
            expect(eventService.getEvents).toHaveBeenCalled();
        });

        it('Should call _getEventsByDay()', () => {
            spyOn(eventCtrl, '_getEventsByDay');
            eventCtrl._loadEvents(eventService.getEvents, december, testYear);
            expect(eventCtrl._getEventsByDay).toHaveBeenCalled();
        });

        it('Should increase +1 on _actualPage', () => {
            eventCtrl._actualPage = 0;
            eventCtrl._loadEvents(eventService.getEvents, december, testYear);
            expect(eventCtrl._actualPage).toEqual(1);
        });

        it('Should update _moreEvents', () => {
            eventCtrl._moreEvents = false;
            eventCtrl._loadEvents(eventService.getEvents, december, testYear);
            expect(eventCtrl._moreEvents).toBeTruthy();
        });

        it('Should to increase the events of controller if not is another month', () => {
            spyOn(Utils, 'isMobileScreen').and.callFake(() => true);
            const ctrl = createCtrl();
            ctrl.showImage = true;
            ctrl.$onInit();
            ctrl._isAnotherMonth = false;
            ctrl.events = requestEvent.events;
            expect(ctrl.events.length).toEqual(2);
            ctrl._loadEvents(eventService.getEvents, december, testYear);
            expect(ctrl.events.length).toEqual(4);
        });

        it('Should update the events of controller if is another month', () => {
            spyOn(Utils, 'isMobileScreen').and.callFake(() => true);
            const ctrl = createCtrl();
            ctrl.showImage = true;
            ctrl.$onInit();
            ctrl._isAnotherMonth = true;
            ctrl.events = [];
            ctrl._loadEvents(eventService.getEvents, december, testYear);
            expect(ctrl.events).toEqual(requestEvent.events);
            expect(ctrl._isAnotherMonth).toBeFalsy();
        });
    });

    describe('newEvent()', () => {

        it('should call mdDialog.show if is mobile screen', () => {
            spyOn(Utils, 'isMobileScreen').and.returnValue(false);
            spyOn(mdDialog, 'show').and.callFake(() => {
                return {
                    then: function (callback) {
                        return callback({});
                    }
                };
            });
            eventCtrl.newEvent();
            expect(mdDialog.show).toHaveBeenCalled();
        });

        it('should call state.go if is not mobile screen', () => {
            spyOn(Utils, 'isMobileScreen').and.returnValue(true);
            spyOn(state, 'go');
            eventCtrl.newEvent();
            expect(state.go).toHaveBeenCalled();
        });
    });

    describe('share()', () => {
        it('should call mdDialog.show', () => {
            spyOn(mdDialog, 'show');
            eventCtrl.share("$event", event);
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('getToolbarMobileGeneralOptions()', () => {
        it('tests the first object', () => {
            spyOn(eventCtrl, 'loadMoreEvents');
            const result = eventCtrl._getToolbarMobileGeneralOptions();

            const firstObject = result.options[0];

            expect(result.options.length).toEqual(2);
            expect(firstObject.title).toEqual('Atualizar');

            firstObject.action();

            expect(eventCtrl._moreEvents).toEqual(true);
            expect(eventCtrl._actualPage).toEqual(0);
            expect(eventCtrl.loadMoreEvents).toHaveBeenCalled();
        });

        it('tests the second object', () => {
            const result = eventCtrl._getToolbarMobileGeneralOptions();

            const secondObject = result.options[1];

            expect(result.options.length).toEqual(2);
            expect(secondObject.title).toEqual('Filtrar por instituição');
        });
    });

    describe('getToolbarMobileMenuItems()', () => {
        beforeEach(() => {
            months[0].month_name = 'Janeiro';
            months[1].month_name = 'Fevereiro';
            eventCtrl.months = months;
            eventCtrl.selectedMonth = months[0];
            eventCtrl.selectedYear = 2019;
    

            spyOn(eventCtrl, 'loadFilteredEvents');
        });

        it('tests the first item', () => {
            const result = eventCtrl._getToolbarMobileMenuItems();

            const firstItem = result[0];
            expect(result.length).toEqual(2);
            expect(firstItem.options.length).toEqual(12);
            expect(firstItem.title).toEqual(months[0].month_name);

            firstItem.action('Fevereiro');
            
            expect(eventCtrl.selectedMonth).toEqual(months[1]);
            expect(eventCtrl.loadFilteredEvents).toHaveBeenCalled();
        });
        
        it('tests the second item', () => {
            const result = eventCtrl._getToolbarMobileMenuItems();

            const secondItem = result[1];
            expect(result.length).toEqual(2);
            expect(secondItem.title).toEqual(2019);

            secondItem.action(2018);

            expect(eventCtrl.selectedYear).toEqual(2018);
            expect(eventCtrl.loadFilteredEvents).toHaveBeenCalled();
        });
    });

    describe('setupToolbarFields', () => {
        it('should call _getToolbarMobileMenuItems and getToolbarMobileGeneralOptions', () => {
            spyOn(eventCtrl, '_getToolbarMobileGeneralOptions');
            spyOn(eventCtrl, '_getToolbarMobileMenuItems');

            eventCtrl.setupToolbarFields();

            expect(eventCtrl._getToolbarMobileGeneralOptions).toHaveBeenCalled();
            expect(eventCtrl._getToolbarMobileMenuItems).toHaveBeenCalled();
        });
    });
}));