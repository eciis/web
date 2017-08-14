'use strict';

(describe('Test SuggestInstitutionController', function() {
    var suggestInstCtrl, httpBackend, createCtrl, state;

    var mdDialog, scope, inviteController, scopeInvite;

    var mayza = {
        name: 'Mayza',
        key: 'user-key',
        invites: [{
            'invitee': 'user@email.com',
            'suggestion_institution_name': "Suggested Name",
            'type_of_invite': "institution",
            'status': 'sent',
            'stub_institution_key': '00001'
        }]
    };

    var splab = {
        name: 'Splab',
        key: '1239'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state,
        AuthService, $mdDialog, InviteService) {
        httpBackend = $httpBackend;
        state = $state;
        mdDialog = $mdDialog;
        scope = $rootScope.$new();
        scopeInvite = $rootScope.$new();

        AuthService.login(mayza);

        inviteController = $controller('InviteInstitutionController', {
            scope: scopeInvite,
            inviteService: InviteService,
        });

        httpBackend.expect('GET', '/api/invites').respond([]);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "error/user_inactive.html").respond(200);
        httpBackend.when('GET', 'invites/existing_institutions.html').respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        httpBackend.when('GET', "auth/login.html").respond(200);

        createCtrl = function() {
            return $controller('SuggestInstitutionController', {
                scope: scope,
                institutions: {},
                invite: mayza.invites[0],
                inviteController: inviteController
            });
        };

        suggestInstCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('cancel()', function() {
        it('should call mdDialog.cancel()', function() {
            spyOn(mdDialog, 'cancel');
            suggestInstCtrl.cancel();
            expect(mdDialog.cancel).toHaveBeenCalled();
        });
    });

    describe('sendInvite()', function() {
        it('should call sendInstInvite()', function() {
            spyOn(inviteController, 'sendInstInvite');
            suggestInstCtrl.sendInvite(suggestInstCtrl.invite);
            expect(inviteController.sendInstInvite).toHaveBeenCalled();
        });
    });

    describe('goToInstitution()', function() {
         it('should call state.go()', function() {
            spyOn(window, 'open');
            suggestInstCtrl.goToInstitution(splab.key);
            expect(window.open).toHaveBeenCalledWith(makeUrl(splab.key), '_blank');
        });
    });

    function makeUrl(institutionKey){
        var url_atual = window.location.href;
        url_atual = url_atual.split('#');
        return url_atual[0] + state.href('app.institution', {institutionKey: institutionKey});
    }
}));