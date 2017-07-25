'use strict';

(describe('Test InviteInstHierarchieController', function() {

    var inviteInstCtrl, httpBackend, scope, inviteService, createCtrl, state, mdToast;

    var splab = {
            name: 'SPLAB',
            key: '987654321',
            sent_invitations: [],
            children_institutions: [],
            parent_institution: {},
            state: 'active'  
    };

    var ecis = {
        name: 'ECIS',
        key: '987654321',
        sent_invitations: [],
        children_institutions: [],
        parent_institution: {splab},
        state: 'pending'  
    };

    var maiana = {
        name: 'Maiana',
        email: 'maiana.brito@gmail.com',
        institutions: [splab.key],
        follows: [splab.key],
        invites:[]
    };

    splab['children_institutions'] = [ecis];

    var invite = new Invite({invitee: "parent@gmail.com", suggestion_institution_name : "Institution Parent"},
                            'institution_parent', splab.key, maiana.email);

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, $mdToast, InviteService, AuthService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        mdToast = $mdToast;
        inviteService = InviteService;
        AuthService.getCurrentUser = function() {
            return new User(maiana);
        };
        httpBackend.expect('GET', '/api/institutions/' + splab.key).respond(splab);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        createCtrl = function() {
            return $controller('InviteInstHierarchieController',
                {
                    scope: scope,
                    inviteService: InviteService,
                });
        };
        state.params.institutionKey = splab.key;
        inviteInstCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('InviteInstHierarchieController properties', function() {

        it('should exist a user and his name is Maiana', function() {
            expect(inviteInstCtrl.user.name).toEqual(maiana.name);
        });

        it('should be equal to splab', function() {
            expect(inviteInstCtrl.institution).toEqual(splab);
        });
    });
    
    describe('InviteInstHierarchieController functions', function() {

        describe('createParentInstInvite()', function() {
            it('should show toast ', function() {
                inviteInstCtrl.institution.parent_institution =  ecis.key;
                inviteInstCtrl.hasParent =  true;

                spyOn(mdToast, 'show');
                inviteInstCtrl.createParentInstInvite();
                expect(mdToast.show).toHaveBeenCalled(); 
            });

            it('should change type_of_invite to institution_parent ', function() {

                inviteInstCtrl.createParentInstInvite();
                expect(inviteInstCtrl.type_of_invite).toEqual('institution_parent');
                expect(inviteInstCtrl.showButton).toBe(false); 
            });
        });

        describe('cancelInvite()', function() {
            it('should clear the object invite and show button ', function() {
                expect(inviteInstCtrl.invite).toEqual({});
                expect(inviteInstCtrl.showButton).toBe(true);
            });
        });

        describe('goToInst()', function() {
            it('should be call state.go ', function() {
                spyOn(state, 'go');
                inviteInstCtrl.goToInst(splab.key);
                expect(state.go).toHaveBeenCalledWith('app.institution', Object({ institutionKey: '987654321' }));
            });
        });

        it('Should not show link', function(){
            expect(inviteInstCtrl.showLink(splab)).toBe(true);
        });

        it('Should show link', function(){
            expect(inviteInstCtrl.showLink(ecis)).toBe(false);
        });

        describe('sendInstInvite()', function() {
            beforeEach(function() {
                spyOn(inviteService, 'sendInvite').and.callFake(function() {return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
            });
            
            it('should call inviteService.sendInvite()', function(done) {
                inviteInstCtrl.invite.invitee = "parent@gmail.com";
                inviteInstCtrl.invite.suggestion_institution_name = "Institution Parent";
                inviteInstCtrl.user.current_institution = splab;
                inviteInstCtrl.type_of_invite = "institution_parent";
                var promise = inviteInstCtrl.sendInstInvite();
                promise.then(function() {
                    expect(inviteService.sendInvite).toHaveBeenCalledWith(invite);

                    // Verifying That Data Is Correctly Updated
                    expect(inviteInstCtrl.invite).toEqual({});
                    expect(inviteInstCtrl.institution.sent_invitations).toEqual([invite]);
                    expect(inviteInstCtrl.institution.parent_institution.name).toEqual(
                        invite.suggestion_institution_name);
                    expect(inviteInstCtrl.type_of_invite).toEqual('');
                    expect(inviteInstCtrl.hasParent).toEqual(true);
                    expect(inviteInstCtrl.showButton).toBe(true);

                    done();
                });
                scope.$apply();
            });
        });
    });
}));