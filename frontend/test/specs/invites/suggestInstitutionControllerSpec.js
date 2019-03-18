'use strict';

(describe('Test SuggestInstitutionController', function() {
    var suggestInstCtrl, httpBackend, createCtrl, state;

    var mdDialog, scope, inviteController, scopeInvite;

    var splab = {
        name: 'Splab',
        key: '1239'
    };

    var mayza = {
        name: 'Mayza',
        key: 'user-key',
        current_institution: splab,
        invites: [{
            'invitee': 'user@email.com',
            'suggestion_institution_name': "Suggested Name",
            'type_of_invite': "institution",
            'status': 'sent',
            'stub_institution': { 'name': "Suggested Name",
                                  'key': '00001'}
        }]
    };

    var url_splab = "/institution/"+ splab.key + "/home";

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

        createCtrl = function() {
            return $controller('SuggestInstitutionController', {
                scope: scope,
                institution: {},
                institutions: {},
                invite: mayza.invites[0],
                requested_invites: [],
                isHierarchy: false,
                inviteController: inviteController
            });
        };

        suggestInstCtrl = createCtrl();
    }));

    describe('cancel()', function() {
        it('should call mdDialog.cancel()', function() {
            spyOn(mdDialog, 'cancel');
            suggestInstCtrl.cancel();
            expect(mdDialog.cancel).toHaveBeenCalled();
        });
    });

    describe('sendInvite()', function() {
        it('should call sendInstInvite()', function() {
            spyOn(inviteController, 'sendInstInvite').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            suggestInstCtrl.checkAndSendInvite(suggestInstCtrl.invite);
            expect(inviteController.sendInstInvite).toHaveBeenCalled();
        });
    });

    describe('goToInstitution()', function() {
        it('should call state.go()', function() {
            spyOn(window, 'open');
            suggestInstCtrl.goToInstitution(splab.key);
            expect(window.open).toHaveBeenCalledWith(url_splab, '_blank');
        });
    });
}));