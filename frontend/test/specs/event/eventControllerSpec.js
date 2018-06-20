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
        'title': 'Title',
        'text': 'Text',
        'local': 'Local',
        'photo_url': null,
        'start_time': date,
        'end_time': date_next_month,
        'institution_key': other_institution.key
    };

    var requestEvent = {
        events: [ event, other_event ],
        next: false
    };

    var requestEventInst = {
        events: [ event ],
        next: false
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

        $httpBackend.expect('GET', GET_EVENTS_URI).respond(requestEvent);
        $httpBackend.expect('GET', GET_EVENTS_INST_URI).respond(requestEventInst);

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
    }));

    describe('main()', function() {

        it('should call functions', function() {
            eventCtrl = createCtrl();
            expect(eventCtrl.posts.length).toBe(0);
        });
    });

    describe('loadMoreEvents()', function() {

        beforeEach(function () {

            spyOn(eventService, 'getEvents').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback(requestEvent);
                    }
                };
            });

            spyOn(eventService, 'getInstEvents').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback(requestEventInst);
                    }
                };
            });
        });

        it('should call getEvents', function(done) {
            expect(eventCtrl.events.length).toBe(0);
            var promise = eventCtrl.loadMoreEvents();
            promise.should.be.fulfilled.then(function() {
                expect(eventCtrl.events.length).toBe(2);
                expect(eventCtrl.events[0].institution_key).toBe(institution.key);
                expect(eventCtrl.events[1].institution_key).toBe(other_institution.key)
            }).should.notify(done);
            scope.$apply();

            expect(eventService.getEvents).toHaveBeenCalledWith(0, undefined);
        });

        it('should call getInstEvent because the controller has institutionKey', function(done) {
            eventCtrl.institutionKey = institution.key
            expect(eventCtrl.events.length).toBe(0);
            eventCtrl.loadMoreEvents();
            var promise = eventCtrl.loadMoreEvents();
            promise.should.be.fulfilled.then(function() {
                expect(eventCtrl.events.length).toBe(1);
                expect(eventCtrl.events[0].institution_key).toBe(institution.key);
            }).should.notify(done);
            scope.$apply();

            expect(eventService.getInstEvents).toHaveBeenCalledWith(0, institution.key);
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