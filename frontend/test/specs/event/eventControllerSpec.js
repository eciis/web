'use strict';

(describe('Test EventController', function () {

    var eventCtrl, scope, httpBackend, rootScope, deffered;
    var createCtrl, eventService, messageService, mdDialog, state;

    var institution = { name: 'Splab', key: '098745' };

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

    var EVENT_URI = "/api/events";

    // Event of institution by User
    var event = {
        'title': 'Title',
        'text': 'Text',
        'local': 'Local',
        'photo_url': null,
        'start_time': date,
        'end_time': date_next_month
    };

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, $q, AuthService,
        $rootScope, EventService, MessageService, $mdDialog, $state) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        deffered = $q.defer();
        eventService = EventService;
        messageService = MessageService;
        mdDialog = $mdDialog;
        state = $state;
        AuthService.login(user);


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
                        return callback();
                    }
                };
            });

            spyOn(eventService, 'getInstEvents').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback();
                    }
                };
            });

            // then: function(callback) {
            //     callback({
            //     'events': [event],
            //     'next': false
            //    });
            // }
        });

        it('should call getEvents', function(done) {
            httpBackend.when('/api/events?page=0&limit=5').respond(200);
            // httpBackend.expect('GET', 'GET', '/api/events?page=0&limit=5').respond(event);
            // httpBackend.expect('GET', '/api/events?page=0&limit=5').respond(200);

            var promise = eventCtrl.loadMoreEvents();
            promise.should.be.fulfilled.then(function() {
                expect(eventCtrl.events).toBe(1);
            }).should.notify(done);
            scope.$apply();

            expect(eventService.getEvents).toHaveBeenCalledWith(0, undefined);
            //expect(eventCtrl.events).toBe(1);
        });

        it('should call getInstEvent because the controller has institutionKey', function() {
            eventCtrl.institutionKey = institution.key
            eventCtrl.loadMoreEvents();
            expect(eventService.getInstEvents).toHaveBeenCalledWith(0, institution.key);
            //expect(eventCtrl.events).toBe(1);
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