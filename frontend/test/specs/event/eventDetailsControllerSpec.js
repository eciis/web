'use strict';

(describe('Test EventDetailsController', function () {

    var eventCtrl, scope, httpBackend, rootScope, deffered, eventService, messageService, mdDialog;

    var splab = { name: 'Splab', key: '098745' };
    var EVENTS_URI = '/api/events';

    var date = new Date('2017-12-14');
    var date_next_month = new Date('2018-01-14');

    var user = {
        name: 'User',
        institutions: [splab],
        follows: splab,
        institutions_admin: splab,
        current_institution: splab,
        key: '123'
    };

    // Event of SPLAB by User
    var event = {
        'title': 'Title',
        'text': 'Text',
        'local': 'Local',
        'photo_url': null,
        'start_time': date,
        'end_time': date,
        'video_url': { url: 'https://www.youtube.com/watch?v=123456789' }
    };

    var post = new Post({}, splab.key);
    post.shared_event = event.key;

    var event_convert_date = new Event(event, splab.key);

    event.end_time = date_next_month;
    var other_event = new Event(event, splab.key);

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, $http, $q, AuthService,
        $rootScope, EventService, MessageService, $mdDialog) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        deffered = $q.defer();
        eventService = EventService;
        messageService = MessageService;
        mdDialog = $mdDialog;
        AuthService.login(user);

        eventCtrl = $controller('EventDetailsController', {
            scope: scope,
            $rootScope: rootScope,
            eventService: eventService,
            messageService: messageService,
            mdDialog: mdDialog
        });

        eventCtrl.showImage = true;

        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('confirmDeleteEvent()', function () {
        beforeEach(function () {
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback();
                    }
                };
            });
            spyOn(eventService, 'deleteEvent').and.callThrough();
        });

        it('Should remove event of events', function () {
            httpBackend.expect('DELETE', EVENTS_URI + '/' + event.key).respond();
            eventCtrl.event = other_event;
            eventCtrl.confirmDeleteEvent("$event", other_event);
            httpBackend.flush();

            expect(eventService.deleteEvent).toHaveBeenCalledWith(other_event);
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('recognizeUrl()', function () {

        it('Should returns a event with https url in text', function () {
            event_convert_date.text = "Access: http://www.google.com";
            event_convert_date.text = eventCtrl.recognizeUrl(event_convert_date.text);
            expect(event_convert_date.text)
                .toEqual("Access: <a href='http://www.google.com' target='_blank'>http://www.google.com</a>");
        });
    });

    describe('editEvent', function () {

        it('should call $mdDialog.show', function () {
            spyOn(mdDialog, 'show').and.returnValue(deffered.promise);
            eventCtrl.editEvent('$event', event);
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('endInOtherMonth', function () {
        it('Should be false when end_time of event is in the same month', function () {
            eventCtrl.event = event_convert_date;
            expect(eventCtrl.endInOtherMonth()).toBeFalsy();
        });

        it('Should be true when end_time of event is in the other month', function () {
            eventCtrl.event = event;
            expect(eventCtrl.endInOtherMonth()).toBeTruthy();
        });

        it('Should be undefined when event is null or undefined', function () {
            eventCtrl.event = null;
            expect(eventCtrl.endInOtherMonth()).toEqual(undefined);
        })
    });

    describe('getVideoUrl', function () {
        it('Should return the embed link https://www.youtube.com/embed/123456789', function () {
            eventCtrl.event = event;
            expect(eventCtrl.getVideoUrl(eventCtrl.event.video_url.url)).toEqual('https://www.youtube.com/embed/123456789')
        });
    });

    describe('endInTheSameDay()', function() {
        it('should return true', function() {
            var startTime = new Date('2018-03-03');
            var endTime = new Date('2018-03-03');
            event.start_time = startTime;
            event.end_time = endTime;
            eventCtrl.event = event;
            var result = eventCtrl.endInTheSameDay();
            expect(result).toBeTruthy();
        });

        it('should return false', function() {
            var startTime = new Date('2018-01-13');
            var endTime = new Date('2018-01-14');
            event.start_time = startTime;
            event.end_time = endTime;
            eventCtrl.event = event;
            var result = eventCtrl.endInTheSameDay();
            expect(result).toBeFalsy();

            var startTime = new Date('2018-01-13');
            var endTime = new Date('2018-02-13');
            event.start_time = startTime;
            event.end_time = endTime;
            eventCtrl.event = event;
            var result = eventCtrl.endInTheSameDay();
            expect(result).toBeFalsy();

            var startTime = new Date('2018-10-04');
            var endTime = new Date('2018-10-11');
            event.start_time = startTime;
            event.end_time = endTime;
            eventCtrl.event = event;
            var result = eventCtrl.endInTheSameDay();
            expect(result).toBeFalsy();
        });
    });

    describe('canChange()', function() {
        
        it('should return true', function () {
            let institution = { key: 'opkaspdapos-OPKSDOAKO' };
            event.key = 'okaspoda-AOPKOSPFKDOP';
            event.institution_key = institution.key;
            eventCtrl.user.permissions = {};
            eventCtrl.user.permissions['remove_post'] = {};
            eventCtrl.user.permissions['remove_post'][event.key] = true;

            let returnedValue = eventCtrl.canChange(event);
            expect(returnedValue).toBeTruthy();

            eventCtrl.user.permissions = {};
            eventCtrl.user.permissions['remove_posts'] = {};
            eventCtrl.user.permissions['remove_posts'][event.institution_key] = true;

            returnedValue = eventCtrl.canChange(event);
            expect(returnedValue).toBeTruthy();
        });
        
        it('should return false', function() {
            let institution = { key: 'opkaspdapos-OPKSDOAKO' };
            event.key = 'okaspoda-AOPKOSPFKDOP';
            event.institution_key = institution.key;
            eventCtrl.user.permissions = {};
            let returnedValue = eventCtrl.canChange(event);
            expect(returnedValue).toBeFalsy();
        });
    });

    describe('canEdit()', function () {

        it('should return true', function() {
            event.key = 'opaksdpo-SIKFSPA';
            eventCtrl.user.permissions = {};
            eventCtrl.user.permissions['edit_post'] = {};
            eventCtrl.user.permissions['edit_post'][event.key] = true;

            let returnedValue = eventCtrl.canEdit(event);
            expect(returnedValue).toBeTruthy();
        });

        it('should return false', function() {
            event.key = 'opaksdpo-SIKFSPA';
            eventCtrl.user.permissions = {};

            let returnedValue = eventCtrl.canEdit(event);
            expect(returnedValue).toBeFalsy();
        });
    });

    describe('getTimeHours()', function() {
        it('should return current hours', function() {
            let date = new Date();
            let hours = date.getHours();

            let returnedHours = eventCtrl.getTimeHours(date.toISOString());
            expect(returnedHours).toEqual(hours);

            date.setHours(22);
            hours = date.getHours();

            returnedHours = eventCtrl.getTimeHours(date.toISOString());
            expect(returnedHours).toEqual(hours);
        });
    });
}));