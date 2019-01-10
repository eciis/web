'use strict';

(describe("Test HttpService", function() {
    var httpBackend, httpService;

    beforeEach(module('webchat'));
    beforeEach(inject(function($httpBackend, HttpService) {
        httpBackend = $httpBackend;
        httpService = HttpService;
    }));

    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    describe("get()", function() {
        it('Should get', function() {
            httpService.get('/test');

            httpBackend.expect('GET', '/test').respond(200);
            httpBackend.flush();
        });
    });

    describe("post()", function() {
        it('Should post', function() {
            httpService.post('/test');

            httpBackend.expect('POST', '/test').respond(200);
            httpBackend.flush();
        });
    });

    describe("put()", function() {
        it('Should put', function() {
            httpService.put('/test');

            httpBackend.expect('PUT', '/test').respond(200);
            httpBackend.flush();
        });
    });

    describe("delete()", function() {
        it('Should delete', function() {
            httpService.delete('/test');

            httpBackend.expect('DELETE', '/test').respond(200);
            httpBackend.flush();
        });
    });
}));
