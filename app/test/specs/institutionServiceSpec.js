'use strict';

(describe('Test InstitutionService', function () {
        var httpBackend, service, $http;
        var INSTITUTIONS_URI = "/api/institutions";
        var raoni = {name: 'Raoni', key: 12345};
        var institutions = [{name: 'Splab',
        key: '098745', followers: [raoni], members: [raoni]
    }];
        var post = {title: 'teste', text: 'post de teste', institution: institutions[0].key};

        beforeEach(module('app'));

        beforeEach(inject(function($httpBackend, InstitutionService, _$http_) {
            httpBackend = $httpBackend;
            $http = _$http_;
            service = InstitutionService;
            httpBackend.when('GET', 'main/main.html').respond(200);
            httpBackend.when('GET', 'home/home.html').respond(200);
            httpBackend.when('GET', 'error/error.html').respond(200);
        }));

        it('Test getInstitutions in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI).respond(institutions);
            var result;
            service.getInstitutions().then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual(institutions);
        });

        it('Test follow', function() {
            spyOn($http, 'post').and.callThrough();
            httpBackend.when('POST', INSTITUTIONS_URI+ "/" + institutions[0].key + "/followers").respond({});
            service.follow(institutions[0].key);
            httpBackend.flush();
            expect($http.post).toHaveBeenCalled();
        });

        it('Test unfollow', function() {
            spyOn($http, 'delete').and.callThrough();
            httpBackend.when('DELETE', INSTITUTIONS_URI+ "/" + institutions[0].key + "/followers").respond({});
            service.unfollow(institutions[0].key);
            httpBackend.flush();
            expect($http.delete).toHaveBeenCalled();
        });

        it('Test getTimeline in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key + "/timeline").respond(post);
            var result;
            service.getTimeline(institutions[0].key).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual(post);
        });

        it('Test getMembers in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key + "/members").respond(institutions[0].members[0]);
            var result;
            service.getMembers(institutions[0].key).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual(raoni);
        });

        it('Test getFollowers in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key + "/followers").respond(institutions[0].followers[0]);
            var result;
            service.getFollowers(institutions[0].key).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual(raoni);
        });

        it('Test getInstitution in success case', function() {
            spyOn($http, 'get').and.callThrough();
            httpBackend.when('GET', INSTITUTIONS_URI + "/" + institutions[0].key ).respond(institutions[0]);
            var result;
            service.getInstitution(institutions[0].key).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual(institutions[0]);
        });

        it('Test searchInstitution', function() {
            var documents = [{name: institutions[0].name, id: institutions[0].key}];
            spyOn($http, 'get').and.callThrough();
            httpBackend.expect('GET', "api/search/institution: " + institutions[0].name + " AND active" ).respond(documents);
            var result;
            service.searchInstitutions(institutions[0].name).then(function(data){
                result = data;
            });
            httpBackend.flush();
            expect($http.get).toHaveBeenCalled();
            expect(result.data).toEqual(documents);
        });

}));