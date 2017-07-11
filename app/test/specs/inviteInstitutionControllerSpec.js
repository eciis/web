'use strict';

(describe('Test InviteInstitutionController', function() {

    var inviteinstitutionCtrl, httpBackend, scope, inviteService, createCtrl, state;

    var splab = {
            name: 'SPLAB',
            key: '987654321' 
    };

    var tiago = {
        name: 'Tiago',
        institutions: splab.key,
        follows: splab.key,
        invites:[]
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, InviteService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        inviteService = InviteService;
        httpBackend.expect('GET', '/api/user').respond(tiago);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
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
            });
            
            it('should call inviteService.sendInvite()', function(done) {
                spyOn(state, 'go');
                inviteinstitutionCtrl.invite = {institution_key: "098745", type_of_invite: "institution", suggestion_institution_name: "New Institution", invitee: "mayzabeel@gmail.com"};
                inviteinstitutionCtrl.user.current_institution = {'key': "123"};
                var invite = new Invite(inviteinstitutionCtrl.invite, 'institution', inviteinstitutionCtrl.user.current_institution.key);
                var promise = inviteinstitutionCtrl.sendInstInvite();
                promise.then(function() {
                    expect(inviteService.sendInvite).toHaveBeenCalledWith(invite);
                    expect(state.go).toHaveBeenCalledWith('app.home');
                    done();
                });
                scope.$apply();
            });
        });
    });
}));