'use strict';

(describe('Test EventController', function () {

    var eventCtrl, scope, httpBackend, rootScope;
    var createCtrl, eventService, messageService, mdDialog, state;

    var institution = { name: 'Institution', key: '098745' };
    var other_institution = { name: 'Ohter Institution', key: '75368' };

    var date = new Date('2017-12-14');
    var date_next_month = new Date('2018-01-14');

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
        'institution_key': institution.key
    };

    var other_event = {
        'title': 'Other event',
        'text': 'Text',
        'local': 'Local',
        'photo_url': null,
        'start_time': date,
        'end_time': date_next_month,
        'institution_key': other_institution.key
    };

    var requestEvent = {
        events: [ event, other_event ],
        next: true
    };

    var requestEventInst = {
        events: [ event ],
        next: true
    };

    var GET_EVENTS_URI = '/api/events?page=0&limit=5';
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

        state.params.posts = [];
        eventCtrl = createCtrl();
        eventCtrl.showImage = true;
        eventCtrl.events = [];
        $httpBackend.flush()
    }));

    describe('main() without definy institution_key', function() {

        beforeEach(function () {

            spyOn(eventService, 'getEvents').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback(requestEvent);
                    }
                };
            });
        });

        it("Should call loadMoreEvents", function() {
            eventCtrl = createCtrl();
            expect(eventService.getEvents).toHaveBeenCalledWith(0, undefined);

            expect(eventCtrl.events).toEqual([event, other_event]);
            expect(eventCtrl.posts).toEqual([]);
        });
    });

    describe('main() definy institution_key', function() {

        beforeEach(function () {

            state.params.institutionKey = institution.key;
            spyOn(eventService, 'getInstEvents').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback(requestEventInst);
                    }
                };
            });
        });

         it('should call getEvents', function() {
            eventCtrl = createCtrl();
            expect(eventService.getInstEvents).toHaveBeenCalledWith(0, institution.key);

            // should only have one event because of the institution's events.
            expect(eventCtrl.events.length).toBe(1);
            expect(eventCtrl.events).toEqual([event]);
            expect(eventCtrl.posts).toEqual([]);
            
        });
    });

    describe('newEvent()', function() {

        it('should call functions', function() {
            spyOn(mdDialog, 'show');
            eventCtrl.newEvent();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('share()', function() {

        it('should call functions', function() {
            spyOn(mdDialog, 'show');
            eventCtrl.share("$event", event);
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });
}));