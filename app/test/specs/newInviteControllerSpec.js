'use strict';

(describe('Test NewInviteController', function() {

    var newInviteCtrl, httpBackend, scope, institutionService, createCtrl, state, inviteService, userService;

    var INSTITUTIONS_URI = "/api/institutions/";

    var splab = {
            name: 'SPLAB',
            key: '987654321' 
    };

    var certbio = {
        name: 'CERTBIO',
        key: '123456789'
    };

    var tiago = {
        name: 'Tiago',
        institutions: [splab.key],
        follows: [splab.key]
    };

    var invite = new Invite({invitee: "mayzabeel@gmail.com", key: 'xyzcis'}, 'user', certbio.key);

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, InstitutionService, UserService, InviteService) {
        userService = UserService;
        inviteService = InviteService;
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        institutionService = InstitutionService;
        httpBackend.expect('GET', '/api/user').respond(tiago);
        httpBackend.expect('GET', INSTITUTIONS_URI + splab.key).respond(splab);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        createCtrl = function() {
            return $controller('NewInviteController',
                {
                    scope: scope,
                    institutionService: institutionService,
                    inviteService: InviteService,
                    userService: UserService
                });
        };
        state.params.inviteKey = 'xyzcis';
        state.params.institutionKey = splab.key;
        newInviteCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('NewInviteController properties', function() {

        it('should exist a user and his name is Tiago', function() {
            expect(newInviteCtrl.user.name).toEqual(tiago.name);
        });

        it('should exist institution', function() {
            expect(newInviteCtrl.institution).toEqual(splab);
        });

        it('inviteKey should be "xyzcis"', function() {
            expect(newInviteCtrl.inviteKey).toEqual('xyzcis');
        });
    });
}));