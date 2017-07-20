'use strict';

(describe('Test NewInviteController', function() {

    var newInviteCtrl, httpBackend, scope, institutionService, createCtrl, state, inviteService, userService,
        mdDialog;

    var INSTITUTIONS_URI = "/api/institutions/";

    var invite = new Invite({invitee: "mayzabeel@gmail.com", key: 'xyzcis'}, 'user', '123456789');

    var splab = {
            name: 'SPLAB',
            key: '987654321',
            sent_invitations: [] 
    };

    var certbio = {
        name: 'CERTBIO',
        key: '123456789',
        sent_invitations: [invite]
    };

    var tiago = {
        name: 'Tiago',
        institutions: [splab],
        follows: [splab.key],
        invites: [invite]
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, $mdDialog, InstitutionService, UserService, InviteService) {
        userService = UserService;
        inviteService = InviteService;
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        mdDialog = $mdDialog;
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

    // TODO FIX
    xdescribe('NewInviteController properties', function() {

        it('should exist a user and his name is Tiago', function() {
            expect(newInviteCtrl.user.name).toEqual(tiago.name);
        });

        it('should exist institution', function() {
            expect(newInviteCtrl.institution).toEqual(splab);
        });

        it('inviteKey should be "xyzcis"', function() {
            expect(newInviteCtrl.inviteKey).toEqual('xyzcis');
        });

        it('user should be contain a invite', function() {
            expect(newInviteCtrl.user.invites).toContain(invite);
        });
    });

    // TODO FIX
    xdescribe('NewInviteController functions', function() {

        describe('acceptInvite()', function() {

            var promise;

            beforeEach(function() {

                spyOn(inviteService, 'deleteInvite').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(userService, 'addInstitution').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback({
                                name: 'Tiago',
                                institutions: [splab, certbio],
                                follows: [splab.key, certbio.key],
                                invites: [invite]
                            });
                        }
                    };
                });
                spyOn(state, 'go');
                spyOn(mdDialog, 'show');
                promise = newInviteCtrl.acceptInvite('$event');
            });

            it('user institutions should be contain certbio after acceptInvite', function(done) {
                promise.then(function() {
                    expect(newInviteCtrl.user.institutions).toContain(certbio);
                    done();
                });
            });

            it('user should be follow certbio after acceptInvite', function(done) {
                promise.then(function() {
                    expect(newInviteCtrl.user.follows).toContain(certbio.key);
                    done();
                });
            });

            it('should be call inviteService.deleteInvite()', function(done) {
                promise.then(function() {
                    expect(inviteService.deleteInvite).toHaveBeenCalledWith(invite.key);
                    done();
                });
            });

            it('should be call $state.go()', function(done) {
                promise.then(function() {
                    expect(state.go).toHaveBeenCalledWith('app.home');
                    done();
                });
            });

            it('should be call $mdDialog.show()', function(done) {
                promise.then(function() {
                    expect(mdDialog.show).toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('rejectInvite()', function() {

            var promise;

            beforeEach(function() {

                spyOn(inviteService, 'deleteInvite').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(mdDialog, 'show').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(state, 'go');
                promise = newInviteCtrl.rejectInvite('$event');
            });

            it('should be call $mdDialog.show()', function(done) {
                promise.then(function() {
                    expect(mdDialog.show).toHaveBeenCalled();
                    done();
                });
            });

            it('should be call inviteService.deleteInvite()', function(done) {
                promise.then(function() {
                    expect(inviteService.deleteInvite).toHaveBeenCalledWith(invite.key);
                    done();
                });
            });

            it('should be call $state.go()', function(done) {
                promise.then(function() {
                    expect(state.go).toHaveBeenCalledWith('app.home');
                    done();
                });
            });
        });
    });
}));