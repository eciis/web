'use strict';

(describe('Test EventController', function () {

    var eventCtrl, scope, httpBackend, rootScope;
    var createCtrl, eventService, messageService, mdDialog, state;

    var institution = { name: 'Institution', key: '098745' };
    var other_institution = { name: 'Ohter Institution', key: '75368' };

    var date = new Date();
    var date_next_month = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());

    var months = [ {"month": 1}, {"month": 2},
        {"month": 3}, {"month": 4},
        {"month": 5}, {"month": 6},
        {"month": 7}, {"month": 8},
        {"month": 9}, {"month": 10},
        {"month": 11}, {"month": 12}];

    var user = {
        name: 'User',
        institutions: [institution],
        follows: [institution],
        institutions_admin: institution,
        current_institution: institution,
        key: '123'
    };

    var event = {
        'title': 'Title',
        'text': 'Text',
        'local': 'Local',
        'photo_url': null,
        'start_time': date,
        'end_time': date_next_month,
        'institution_key': institution.key,
        'key': '12345'
    };

    var other_event = {
        'title': 'Other event',
        'text': 'Text',
        'local': 'Local',
        'photo_url': null,
        'start_time': date,
        'end_time': date_next_month,
        'institution_key': other_institution.key,
        'key': '54321'
    };

    var requestEvent = {
        events: [ event, other_event ],
        next: true
    };

    var requestEventInst = {
        events: [ event ],
        next: true
    };

    var GET_EVENTS_URI = '/api/events?page=0&limit=5&month=' + date.getMonth() + '&year=' + date.getFullYear();
    var GET_EVENTS_INST_URI = '/api/institutions/'+institution.key+'/events?page=0&limit=5';
    

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, AuthService,
        $rootScope, EventService, MessageService, $mdDialog, $state) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        eventService = EventService;
        messageService = MessageService;
        mdDialog = $mdDialog;
        state = $state;
        AuthService.login(user);

        httpBackend.when('GET', GET_EVENTS_URI).respond(requestEvent);
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
    }));

    describe('main() without definy institution_key', () => {

        it("Should not has an institution_key", () => {
            expect(eventCtrl.institutionKey).toEqual(undefined);
        });
    });

    describe('main() definy institution_key', () => {

        beforeEach( () => {
            state.params.institutionKey = institution.key;
        });

        it("Should not has an institution_key", () => {
            eventCtrl = createCtrl();
            expect(eventCtrl.institutionKey).toEqual(institution.key);
        });
    });

    describe('goToEvent()', () => {

        beforeEach(() => {
            spyOn(state, 'go');
        });

        it('Should call state.go', () => {
            eventCtrl.goToEvent(event);
            expect(state.go).toHaveBeenCalledWith('app.user.event', { eventKey: event.key, posts: eventCtrl.posts });
        });
    });

    describe('loadFilteredEvents()', () => {

        beforeEach(() => {
            spyOn(eventCtrl, 'loadMoreEvents');
        });

        it('Should call loadMoreEvents', () => {
            eventCtrl.loadFilteredEvents();
            expect(eventCtrl.loadMoreEvents).toHaveBeenCalled();
        });
    });

    describe('_getEventsByDay()', () => {

        it('Should populate the eventsByDay array', () => {
            eventCtrl.events = requestEvent.events;
            expect(eventCtrl.eventsByDay.length).toEqual(0);
            eventCtrl._getEventsByDay();
            expect(eventCtrl.eventsByDay.length).toEqual(1);
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
    });

    describe('newEvent()', () => {

        it('should call functions', () => {
            spyOn(mdDialog, 'show');
            eventCtrl.newEvent();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('share()', () => {

        it('should call functions', () => {
            spyOn(mdDialog, 'show');
            eventCtrl.share("$event", event);
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });
}));