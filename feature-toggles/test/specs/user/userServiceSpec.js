'use strict';

(describe('Test UserService', function () {
        let httpBackend, service, $http, scope;

        const user = {
            name: 'User',
            key: '12345',
            state: 'active',
            profile: {
                'institutional_email': 'user@ccc.ufcg.edu.br',
                'office': 'developer'
            }
        };

        const institution = {
            name: 'Splab',
            key: '098745',
            followers: [user.key],
            members: [user.key]
        };

        user.current_institution = institution;
        user.follows = [institution.key];
        user.institutions = [institution.key];

        beforeEach(module('app'));

        beforeEach(inject(function($httpBackend, UserService, HttpService, $rootScope, AuthService) {
            httpBackend = $httpBackend;
            $http = HttpService;
            scope = $rootScope.$new();
            service = UserService;
            AuthService.login(user);
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
            it('load()', function(done) {
                service.load().then(function(data){
                    expect(data).toEqual(user);
                    done();
                });
            });

        });
}));