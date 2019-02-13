'use strict';

(describe('Test EventService', function () {
        var httpBackend, service, $http, scope;

        var EVENT_URI = "/api/events";
        var INST_URI = "/api/institutions/"
        var LIMIT = "15";

        var page = 1;

        var user = {
            name: 'User Test',
            key: '12345',
            state: 'active'
        };

        var institution = {
            name: 'Splab',
            key: '098745',
            followers: [user],
            members: [user]
        };

        user.current_institution = institution;

        var date = new Date('2018-06-05');

        var event = {
            'title': 'Title',
            'text': 'Text',
            'local': 'Local',
            'photo_url': null,
            'start_time': date,
            'end_time': date,
            'key': '123456',
            'video_url': {},
            'institution_key': institution.key
        };

        var events = [];

        beforeEach(module('app'));

        beforeEach(inject(function($httpBackend, EventService, HttpService, $rootScope) {
            httpBackend = $httpBackend;
            $http = HttpService;
            scope = $rootScope.$new();
            service = EventService;
            httpBackend.when('GET', 'main/main.html').respond(200);
            httpBackend.when('GET', 'home/home.html').respond(200);
            httpBackend.when('GET', 'error/error.html').respond(200);
            httpBackend.when('GET', 'auth/login.html').respond(200);
            service.user = user;

            for(var i = 0; i < 5; i++) {
                events.push(event);
            }
        }));

        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        describe('Test EventService functions', function() {

            it('createEvent()', function() {
                spyOn($http, 'post').and.callThrough();
                httpBackend.expect('POST', EVENT_URI).respond(event);
                var result;
                service.createEvent(event).then(function(data){
                    result = data;
                });
                httpBackend.flush();
                expect($http.post).toHaveBeenCalledWith(EVENT_URI, event);
                expect(result).toEqual(event);
            });
    
            it('getEvent()', function() {
                spyOn($http, 'get').and.callThrough();
                httpBackend.expect('GET', EVENT_URI + '/' + event.key).respond(event);
                var result;
                service.getEvent(event.key).then(function(data){
                    result = data;
                });
                httpBackend.flush();
                expect($http.get).toHaveBeenCalledWith(EVENT_URI + '/' + event.key);
                expect(result).toEqual(event);
            });
    
            it('getEvents()', function() {
                spyOn($http, 'get').and.callThrough();
                httpBackend.expect('GET', EVENT_URI + '?page=' + page + "&limit=" + LIMIT).respond(events);
                var result;
                service.getEvents({page: page}).then(function(data){
                    result = data;
                });
                httpBackend.flush();
                expect($http.get).toHaveBeenCalledWith(EVENT_URI + '?page=' + page + "&limit=" + LIMIT);
                expect(result).toEqual(events);
            });
    
            it('getInstEvents()', function() {
                spyOn($http, 'get').and.callThrough();
                httpBackend.expect('GET', INST_URI + institution.key + '/events?page=' + page + "&limit=" + LIMIT).respond(events);
                var result;
                service.getInstEvents({page: page, institutionKey: institution.key}).then(function(data){
                    result = data;
                });
                httpBackend.flush();
                expect($http.get).toHaveBeenCalledWith(INST_URI + institution.key + '/events?page=' + page + "&limit=" + LIMIT);
                expect(result).toEqual(events);
            });
    
            it('deleteEvent()', function() {
                spyOn($http, 'delete').and.callThrough();
                httpBackend.expect('DELETE', EVENT_URI + '/' + event.key).respond();
                service.deleteEvent(event);
                httpBackend.flush();
                expect($http.delete).toHaveBeenCalledWith(EVENT_URI + '/' + event.key);
            });
    
            it('editEvent()', function() {
                spyOn($http, 'patch').and.callThrough();
                httpBackend.when('PATCH', EVENT_URI + '/' + event.key)
                                        .respond(200, {status: 200, msg: "success"});
                var patch = [{op: 'replace', path: '/title', value: 'Patched Title'}];
                var result;
                service.editEvent(event.key, patch).then(function(data) {
                    result = data;
                });
                httpBackend.flush();
                expect($http.patch).toHaveBeenCalledWith(EVENT_URI + '/' + event.key, patch);
            });

            describe('addFollower', () => {
                it('should call post', () => {
                    spyOn($http, 'post');

                    service.addFollower('aposkpdoskpodkapd');

                    expect($http.post).toHaveBeenCalledWith('/api/events/aposkpdoskpodkapd/followers');
                });
            });

            describe('removeFollower', () => {
                it('should call delete', () => {
                    spyOn($http, 'delete');

                    service.removeFollower('aposkpdoskpodkapd');

                    expect($http.delete).toHaveBeenCalledWith('/api/events/aposkpdoskpodkapd/followers');
                });
            });
        });
}));