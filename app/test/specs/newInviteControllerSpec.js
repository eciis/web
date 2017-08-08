'use strict';

(describe('Test NewInviteController', function() {

    var newInviteCtrl, httpBackend, scope, institutionService, createCtrl, state, inviteService, userService,
        mdDialog, authService;

    var INSTITUTIONS_URI = "/api/institutions/";

    var invite = new Invite({invitee: "mayzabeel@gmail.com", key: 'xyzcis'}, 'user', '123456789', 'mayzabeel@gmail.com');

    var inviteInst = new Invite({invitee: "mayzabeel@gmail.com", key: 'xyzcps', suggestion_institution_name : "New Institution"}, 'institution', '987654321');

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
        invites: [invite],
        accessToken: '00000'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, $mdDialog, InstitutionService, UserService, InviteService, AuthService) {
        userService = UserService;
        inviteService = InviteService;
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        mdDialog = $mdDialog;
        institutionService = InstitutionService;
        authService = AuthService;
        httpBackend.expect('GET', INSTITUTIONS_URI + splab.key).respond(splab);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        AuthService.getCurrentUser = function() {
            return new User(tiago);
        };
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

    describe('NewInviteController properties', function() {

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

    describe('NewInviteController functions', function() {

        describe('addInstitution()', function() {

            var promise;

            beforeEach(function() {

                spyOn(inviteService, 'deleteInvite').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(authService, 'reload').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback(newInviteCtrl.user = {
                                name: 'Tiago',
                                institutions: [splab, certbio],
                                follows: [splab.key, certbio.key],
                                invites: [invite],
                                accessToken: '00000'
                            });
                        }
                    };
                });
                spyOn(userService, 'addInstitution').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(state, 'go');
                spyOn(mdDialog, 'show');
                promise = newInviteCtrl.addInstitution('$event');
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

            it('should be call authService.reload()', function(done) {
                promise.then(function() {
                    expect(authService.reload).toHaveBeenCalled();
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
                spyOn(authService, 'reload').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback(newInviteCtrl.user = {
                                name: 'Tiago',
                                institutions: [splab, certbio],
                                follows: [splab.key, certbio.key],
                                invites: [invite],
                                accessToken: '00000'
                            });
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
                promise = newInviteCtrl.rejectUserInvite('$event');
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

            it('should be call authService.reload()', function(done) {
                promise.then(function() {
                    expect(authService.reload).toHaveBeenCalled();
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