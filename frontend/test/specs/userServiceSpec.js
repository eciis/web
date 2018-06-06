'use strict';

(describe('Test UserService', function () {
        var httpBackend, service, $http, scope;

        var USER_URI = "/api/user";

        var user = {
            name: 'User',
            key: '12345',
            state: 'active',
            profile: {
                'institutional_email': 'user@ccc.ufcg.edu.br',
                'office': 'developer'
            }
        };

        var institution = {
            name: 'Splab',
            key: '098745',
            followers: [user.key],
            members: [user.key]
        };

        user.current_institution = institution;
        user.follows = [institution.key];
        user.institutions = [institution.key];

        beforeEach(module('app'));

        beforeEach(inject(function($httpBackend, UserService, _$http_, $rootScope) {
            httpBackend = $httpBackend;
            $http = _$http_;
            scope = $rootScope.$new();
            service = UserService;
            httpBackend.when('GET', 'main/main.html').respond(200);
            httpBackend.when('GET', 'home/home.html').respond(200);
            httpBackend.when('GET', 'error/error.html').respond(200);
            httpBackend.when('GET', 'auth/login.html').respond(200);
        }));

        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        describe('Test UserService functions', function() {

            it('deleteAccount()', function() {
                spyOn($http, 'delete').and.callThrough();
                httpBackend.expect('DELETE', USER_URI).respond();
                service.deleteAccount();
                httpBackend.flush();
                expect($http.delete).toHaveBeenCalledWith(USER_URI);
            });

            it('save()', function() {
                spyOn($http, 'patch').and.callThrough();
                httpBackend.when('PATCH', USER_URI)
                                        .respond(200, {status: 200, msg: "success"});
                var patch = [{op: 'replace', path: '/name', value: 'Patched Name'}];
                var result;
                service.save(patch).then(function(data) {
                    result = data;
                });
                httpBackend.flush();
                expect($http.patch).toHaveBeenCalledWith(USER_URI, patch);
            });

            it('getUser()', function() {
                spyOn($http, 'get').and.callThrough();
                httpBackend.expect('GET', USER_URI + "/" + user.key + "/profile").respond(user.profile);
                var result;
                service.getUser(user.key).then(function(data){
                    result = data;
                });
                httpBackend.flush();
                expect($http.get).toHaveBeenCalledWith(USER_URI + "/" + user.key + "/profile");
                expect(result).toEqual(user.profile);
            });

            it('load()', function() {
                var result;
                service.load().then(function(data){
                    result = data;
                });
                expect(result).toEqual({name: 'User'});
            });

            it('deleteInstitution()', function() {
                spyOn($http, 'delete').and.callThrough();
                httpBackend.expect('DELETE', USER_URI + '/institutions/' + institution.key + '/institutional-operations').respond();
                service.deleteInstitution(institution.key);
                httpBackend.flush();
                expect($http.delete).toHaveBeenCalledWith(USER_URI + '/institutions/' + institution.key + '/institutional-operations');
            });
        });
}));