'use strict';

describe('Test SubmitInstController', function() {
    var submitInstCtrl, scope, institutionService, state, deferred;
    var mdToast, mdDialog, http, inviteService, httpBackend;
    var institution = {
            name: "submitInstCtrl.invite.suggestion_institution_name",
            image_url: "",
            email: "submitInstCtrl.invite.invitee",
            state: "active"
        };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $q, $state, $mdToast, 
        $rootScope, $mdDialog, $http, InstitutionService, InviteService) {
        scope = $rootScope.$new();
        submitInstCtrl = $controller('SubmitInstController', {scope: scope});
        httpBackend = $httpBackend;
        deferred = $q.defer();
        state = $state;
        http = $http;
        mdDialog = $mdDialog;
        mdToast = $mdToast;
        institutionService = InstitutionService;
        inviteService = InviteService;
        submitInstCtrl.institution = institution;
        httpBackend.expectGET('/api/user').respond(user);
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.flush();  
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('Name of the group', function() {
        it('should behave...', function() {
            expect(true).toBe(true);
        });
    });
});