'use strict';

(describe('Test FollowersInstController', function() {

    var followersCtrl, httpBackend, scope, institutionService, createCtrl, state;

    var INSTITUTIONS_URI = "/api/institutions/";

    var institution = {
        acronym: 'institution',
        key: '987654321',
        photo_url: "photo_url"
    };

    var user = {
        name: 'user',
        institutions: [institution],
        follows: [institution],
        institutions_admin: institution,
        current_institution: institution
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, InstitutionService, AuthService) {
        httpBackend = $httpBackend;
        state = $state;
        scope = $rootScope.$new();
        institutionService = InstitutionService;

        httpBackend.expect('GET', INSTITUTIONS_URI + institution.key + '/followers').respond([user]);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', 'institution/removeInstDialog.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);

        AuthService.login(user);

        createCtrl = function() {
            return $controller('FollowersInstController',
                {
                    scope: scope,
                    institutionService: institutionService
                });
        };
        state.params.institutionKey = institution.key;
        followersCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('InstitutionController properties', function() {

        it('should exist followers', function() {
            expect(followersCtrl.followers).toEqual([user]);
        });
    });
}));