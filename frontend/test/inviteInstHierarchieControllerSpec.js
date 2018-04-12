'use strict';

(fdescribe('Test InviteInstHierarchieController', function () {
        var httpBackend, scope, state, mdDialog, instService, requestInvitationService, inviteService, inviteInstHierarchieCtrl, createCtrl;

    var institution = {
        key: 'kaopsdkoas-IAKSDOoksHo'
    };

    var user = {
        name: 'user',
        institutions: [institution],
        current_institution: institution,
        follows: institution.key,
        permissions: {
            analyze_request_inst: {
                '987654321': true
            }
        },
        invites: []
    };

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, $rootScope, $state, $mdDialog, 
        AuthService, InstitutionService, RequestInvitationService, InviteService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        mdDialog = $mdDialog;
        instService = InstitutionService;
        requestInvitationService = RequestInvitationService;
        inviteService = InviteService;

        AuthService.login(user);

        httpBackend.expect('GET', `/api/institutions/${institution.key}`).respond(institution);
        httpBackend.when('GET', `/api/institutions/${institution.key}/requests/institution_children`).respond([]);
        httpBackend.when('GET', `/api/institutions/${institution.key}/requests/institution_parent`).respond([]);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        httpBackend.when('GET', "auth/login.html").respond(200);

        createCtrl = function () {
            return $controller('InviteInstHierarchieController',
                {
                    scope: scope,
                    RequestInvitationService: RequestInvitationService,
                    InviteService: InviteService,
                    InstitutionService: InstitutionService
                });
        };
        state.params.institutionKey = institution.key;
        inviteInstHierarchieCtrl = createCtrl();
        httpBackend.flush();
    }));

    describe('linkParentStatus', function () {
        var mainInst, secondInst, returnedValue;
        beforeEach(function () {
            mainInst = { key: 'akpakfaoAs-FOAmgkfhmk' };
            secondInst = { key: 'pokasodpkao-AkaksdaaOGM' };
            returnedValue;
        });

        it('should return confirmed', function () {
            mainInst.parent_institution = secondInst;
            secondInst.children_institution = [mainInst];
            inviteInstHierarchieCtrl.institution = mainInst;

            returnedValue = inviteInstHierarchieCtrl.linkParentStatus();

            expect(returnedValue).toEqual('confirmado');
        });

        it('should return not confirmed', function () {
            inviteInstHierarchieCtrl.institution = mainInst;
            returnedValue = inviteInstHierarchieCtrl.linkParentStatus();
            expect(returnedValue).toEqual('não confirmado');

            mainInst.parent_institution = secondInst;
            expect(inviteInstHierarchieCtrl.institution.parent_institution).toEqual(secondInst);
            returnedValue = inviteInstHierarchieCtrl.linkParentStatus();
            expect(returnedValue).toEqual('não confirmado');
        });
    });
}));