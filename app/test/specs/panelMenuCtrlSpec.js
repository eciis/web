'use strict';

(describe('Test PanelMenuCtrl', function() {

    var panelCtrl, httpBackend, scope, createCtrl, state, instService, panelRef;

    var mayza = {
        name: 'Mayza',
        key: 'user-key',
        invites: [{
            'invitee': 'user@email.com',
            'suggestion_institution_name': "Suggested Name",
            'type_of_invite': "institution",
            'status': 'sent'
        }]
    };

    var splab = {
        name: 'Splab',
        key: '1239'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, AuthService, InstitutionService, $mdPanel) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        instService = InstitutionService;

        AuthService.getCurrentUser = function() {
            return new User(mayza);
        };

        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "search_panel.html").respond(200);
        httpBackend.when('GET', "error/user_inactive.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        httpBackend.when('GET', "auth/login.html").respond(200);
        createCtrl = function() {
            return $controller('PanelMenuCtrl', {
                scope: scope,
                mdPanelRef: $mdPanel.open({})
            });
        };
        panelCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('goToInstitution', function() {

        it('Should call getInstitution in goToInstitution', function() {
            spyOn(instService, 'getInstitution').and.callThrough();
            spyOn(state, 'go').and.callThrough();
            httpBackend.expect('GET', "/api/institutions/" + splab.key).respond(splab);
            panelCtrl.goToInstitution(splab.key);
            httpBackend.flush();
            expect(state.go).toHaveBeenCalled();
            expect(instService.getInstitution).toHaveBeenCalledWith(splab.key);
        });
    });
}));