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
        institutions: splab.key,
        follows: splab.key,
        invites:[]
    };

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
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('InviteInstitutionController properties', function() {

        it('should exist a user and his name is Tiago', function() {
            expect(inviteinstitutionCtrl.user.name).toEqual(tiago.name);
        });
    });

    describe('InviteInstitutionController functions', function() {

        describe('cancelInvite()', function() {
            it('should call state.go app.home ', function() {
                spyOn(state, 'go');
                inviteinstitutionCtrl.cancelInvite();
                expect(state.go).toHaveBeenCalledWith('app.home');
            });
        });

        describe('sendInstInvite()', function() {
            beforeEach(function() {
                spyOn(inviteService, 'sendInvite').and.callFake(function() {
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
                    expect(inviteService.sendInvite).toHaveBeenCalledWith(invite);
                    done();
                });
                scope.$apply();
            });

            it('should call sendInvite() and searchInstitutions()', function(done) {
                spyOn(instService, 'searchInstitutions').and.callThrough();
                spyOn(inviteinstitutionCtrl, 'sendInstInvite');
                inviteinstitutionCtrl.user.current_institution = splab;
                httpBackend.expect('GET', "api/search/institution?name=New Institution&state=active,pending").respond({});
                inviteinstitutionCtrl.checkInstInvite().then(function() {
                    var testingInvite = new Invite(invite, 'institution', splab.key);
                    expect(instService.searchInstitutions).toHaveBeenCalledWith(
                        inviteinstitutionCtrl.invite.suggestion_institution_name,
                        "active,pending");
                    expect(inviteinstitutionCtrl.sendInstInvite).toHaveBeenCalledWith(testingInvite);
                    done();
                });
                httpBackend.flush();
            });

            it('should call showDialog()', function(done) {
                var documents = [{name: splab.name, id: splab.key}];
                spyOn(inviteinstitutionCtrl, 'showDialog');
                httpBackend.expect('GET', "api/search/institution?name=New Institution&state=active,pending").respond(documents);
                inviteinstitutionCtrl.checkInstInvite().then(function() {
                    expect(inviteinstitutionCtrl.showDialog).toHaveBeenCalled();
                    done();
                });
                httpBackend.flush();
            });
        });
    });
}));