'use strict';

(describe('Test InviteInstitutionController', function() {

    var inviteinstitutionCtrl, httpBackend, scope, inviteService, createCtrl, state, instService;

    var splab = {
            name: 'SPLAB',
            key: '987654321',
            sent_invitations: []
    };

    var tiago = {
        name: 'Tiago',
        institutions: [splab],
        follows: splab.key,
        invites:[]
    };

    var INSTITUTION_SEARCH_URI = '/api/search/institution?value=';

    var invite = new Invite({invitee: "mayzabeel@gmail.com", suggestion_institution_name : "New Institution"}, 'institution', splab.key);

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state,
        InviteService, AuthService, InstitutionService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        inviteService = InviteService;
        instService = InstitutionService;

        AuthService.login(tiago);

        httpBackend.expect('GET', '/api/invites').respond([]);
        httpBackend.expect('GET', '/api/institutions/requests/institution').respond([]);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        httpBackend.when('GET', "auth/login.html").respond(200);

        createCtrl = function() {
            return $controller('InviteInstitutionController',
                {
                    scope: scope,
                    inviteService: InviteService,
                });
        };
        state.params.institutionKey = splab.key;
        inviteinstitutionCtrl = createCtrl();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('InviteInstitutionController properties', function() {

        it('should exist a user and his name is Tiago', function() {
            expect(inviteinstitutionCtrl.user.name).toEqual(tiago.name);
            httpBackend.flush();
        });
    });

    describe('InviteInstitutionController functions', function() {

        describe('sendInstInvite()', function() {
            beforeEach(function() {
                spyOn(inviteService, 'sendInviteInst').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                inviteinstitutionCtrl.invite = invite;
            });

            it('should call inviteService.sendInvite()', function(done) {
                inviteinstitutionCtrl.user.current_institution = splab;
                var promise = inviteinstitutionCtrl.sendInstInvite(invite);
                promise.then(function() {
                    expect(inviteService.sendInviteInst).toHaveBeenCalledWith(invite);
                    done();
                });
                httpBackend.flush();
            });

            it('should call sendInvite() and searchInstitutions()', function(done) {
                spyOn(instService, 'searchInstitutions').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback({});
                        }
                    };
                });
                spyOn(inviteinstitutionCtrl, 'sendInstInvite');
                inviteinstitutionCtrl.user.current_institution = splab;
                inviteinstitutionCtrl.checkInstInvite().then(function() {
                    var testingInvite = new Invite(invite, 'INSTITUTION', splab.key);
                    expect(instService.searchInstitutions).toHaveBeenCalledWith(
                        inviteinstitutionCtrl.invite.suggestion_institution_name,
                        "active,pending", 'institution');
                    expect(inviteinstitutionCtrl.sendInstInvite).toHaveBeenCalledWith(testingInvite);
                    done();
                });
                httpBackend.flush();
            });

            it('should call showDialog()', function(done) {
                var documents = {data: {name: splab.name, id: splab.key}};
                spyOn(inviteinstitutionCtrl, 'showDialog');
                spyOn(instService, 'searchInstitutions').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback(documents);
                        }
                    };
                });
                inviteinstitutionCtrl.checkInstInvite().then(function() {
                    expect(inviteinstitutionCtrl.showDialog).toHaveBeenCalled();
                    done();
                });
                httpBackend.flush();
            });

            it('should change properties invite and sent_invitations', function(done){
                var promise = inviteinstitutionCtrl.sendInstInvite(invite);
                promise.then(function() {
                    expect(inviteinstitutionCtrl.invite).toEqual({});
                    expect(inviteinstitutionCtrl.showInvites).toBe(true);
                    expect(inviteinstitutionCtrl.showSendInvite).toBe(false);
                    expect(invite.status).toEqual('sent');
                    expect(inviteinstitutionCtrl.sent_invitations).toEqual([invite]);
                    done();
                });
                httpBackend.flush();
            });
        });

        describe('cancelInvite()', function() {
            it('should clear the object invite', function() {
                inviteinstitutionCtrl.invite = {
                    invitee: "invitee@gmail.com",
                    suggestion_institution_name : "Institution"};
                inviteinstitutionCtrl.cancelInvite();

                httpBackend.flush();

                expect(inviteinstitutionCtrl.invite).toEqual({});
                expect(inviteinstitutionCtrl.showSendInvite).toBe(true);
            });
        });
    });
}));