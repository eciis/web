'use strict';

(describe('Test InstitutionService', function () {
        var httpBackend, $q, service, $http;
        var INSTITUTIONS_URI = "/api/institutions";
        var raoni = {name: 'Raoni', key: 12345};
        var institutions = [{name: 'Splab',
        key: '098745', followers: [raoni], members: [raoni]
    }];
        var post = {title: 'teste', text: 'post de teste', institution: institutions[0].key};

        beforeEach(module('app'));

        beforeEach(inject(function($httpBackend, _$q_, InstitutionService, _$http_) {
            httpBackend = $httpBackend;
            $q = _$q_;
            $http = _$http_;
            service = InstitutionService;
        }));

        it('Spy getInstitutions in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI).respond($q.when(institutions));
            var result;
            service.getInstitutions().then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data.$$state.value).toEqual(institutions);
        });

        it('Spy getInstitutions in fail case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI).respond(404, $q.when());
            var result;
            service.getInstitutions().catch(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.status).toEqual(404);
        });

        it('Spy follow', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.when('POST', INSTITUTIONS_URI+ "/" + institutions[0].key + "/followers").respond({});
            service.follow(institutions[0].key);
            httpBackend.flush();
            expect($http.post).toHaveBeenCalled();
        });

        it('Spy unfollow', function() {
            spyOn($http, 'delete').and.callThrough();
            httpBackend.when('DELETE', INSTITUTIONS_URI+ "/" + institutions[0].key + "/followers").respond({});
            service.unfollow(institutions[0].key);
            httpBackend.flush();
            expect($http.delete).toHaveBeenCalled();
        });

        it('Spy getTimeline in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key + "/timeline").respond($q.when(post));
            var result;
            service.getTimeline(institutions[0].key).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data.$$state.value).toEqual(post);
        });

        it('Spy getTimeline in fail case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key + "/timeline").respond(404, $q.when());
            var result;
            service.getTimeline(institutions[0].key).catch(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.status).toEqual(404);
        });

        it('Spy getMembers in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key + "/members").respond($q.when(institutions[0].members[0]));
            var result;
            service.getMembers(institutions[0].key).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data.$$state.value).toEqual(raoni);
        });

        it('Spy getMembers in fail case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key + "/members").respond(500, $q.when());
            var result;
            service.getMembers(institutions[0].key).catch(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data.$$state.value).toEqual(undefined);
        });

        it('Spy getFollowers in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key + "/followers").respond($q.when(institutions[0].followers[0]));
            var result;
            service.getFollowers(institutions[0].key).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data.$$state.value).toEqual(raoni);
        });

        it('Spy getFollowers in fail case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key + "/followers").respond(404, $q.when());
            var result;
            service.getFollowers(institutions[0].key).catch(function(data){
                result = data;
            });
            httpBackend.flush();
            console.log(result);
            expect($http.get).toHaveBeenCalled();
            expect(result.data.$$state.value).toEqual(undefined);
        });

        it('Spy getInstitution in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key ).respond($q.when(institutions[0]));
            var result;
            service.getInstitution(institutions[0].key).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data.$$state.value).toEqual(institutions[0]);
        });

        it('Spy getInstitution in fail case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key ).respond(404, $q.when());
            var result;
            service.getInstitution(institutions[0].key).catch(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data.$$state.value).toEqual(undefined);
        });

}));