'use strict';

(describe('Test NewInviteController', function() {

    var newInviteCtrl, httpBackend, scope, institutionService, createCtrl, state, inviteService, userService,
        mdDialog, authService;
    var INVITES_URI = "/api/invites/";

    var institution = {
            name: 'institution',
            key: '987654321',
            institutions_admin: [],
            sent_invitations: []
    };
    var otherInstitution = {
        name: 'otherInstitution',
        key: '123456789',
        sent_invitations: []
    };
    var inviteData = {
        invitee: "user@gmail.com",
        key: 'xyzcis',
        type_of_invite: 'USER',
        institution_key: '987654321',
        inviter_key: '21212121',
        status: 'sent',
        institution: otherInstitution
    };
    var invite = new Invite(inviteData);
    invite.stub_institution = {'name': 'Suggested Name', 'key': '00001'};

    var otherUser = {
        name: 'otherUser',
        institutions: [institution, otherInstitution],
        institutions_admin: [],
        follows: [institution.key, otherInstitution.key],
        invites: [invite],
        accessToken: '00000',
        state: 'active',
        institution_profiles: []
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
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', INVITES_URI + invite.key).respond(invite);
        httpBackend.when('GET', "home/home.html").respond(200);
        AuthService.login(otherUser);
        createCtrl = function() {
            return $controller('NewInviteController',
                {
                    scope: scope,
                    institutionService: institutionService,
                    inviteService: InviteService,
                    userService: UserService
                });
        };
        state.params.key = 'xyzcis';
        newInviteCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('NewInviteController properties', function() {

        it('should exist a user and his name is otherUser', function() {
            expect(newInviteCtrl.user.name).toEqual(otherUser.name);
        });

        it('should exist institution', function() {
            expect(newInviteCtrl.institution).toEqual(otherInstitution);
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

                spyOn(inviteService, 'acceptInvite').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback(otherUser);
                        }
                    };
                });
                spyOn(state, 'go');
                spyOn(mdDialog, 'show');
                promise = newInviteCtrl.addInstitution('$event');
            });

            it('user institutions should be contain otherInstitution after acceptInvite', function(done) {
                promise.then(function() {
                    expect(newInviteCtrl.user.institutions).toContain(otherInstitution);
                    done();
                });
            });

            it('user should be follow otherInstitution after acceptInvite', function(done) {
                promise.then(function() {
                    expect(newInviteCtrl.user.follows).toContain(otherInstitution.key);
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

            it('should user state active', function(done) {
                promise.then(function() {
                    expect(newInviteCtrl.user.state).toEqual('active');
                    done();
                });
            });
        });

        describe('updateStubInstitution()', function() {

            var promise;

            beforeEach(function() {

                spyOn(authService, 'save').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(institutionService, 'save').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback(newInviteCtrl.user.current_institution = {
                                            name: 'otherInstitution',
                                            key: '123456789',
                                            sent_invitations: [invite]
                            });
                        }
                    };
                });
                spyOn(newInviteCtrl.user, 'addProfile');
                spyOn(state, 'go');
                promise = newInviteCtrl.updateStubInstitution();
            });

            it('user institutions should be contain otherInstitution after acceptInvite', function(done) {
                promise.then(function() {
                    expect(newInviteCtrl.user.institutions).toContain(otherInstitution);
                    done();
                });
            });

            it('user should active', function(done) {
                promise.then(function() {
                    expect(newInviteCtrl.user.state).toEqual("active");
                    done();
                });
            });

            it('current institution of user should be otherInstitution', function(done) {
                promise.then(function() {
                    expect(newInviteCtrl.user.current_institution.name).toEqual(otherInstitution.name);
                    done();
                });
            });

            it('should call addProfile()', function(done) {
                promise.then(function() {
                    expect(newInviteCtrl.user.addProfile).toHaveBeenCalled();
                    done();
                });
            });

            it('should call authService.reload()', function(done) {
                promise.then(function() {
                    expect(authService.save).toHaveBeenCalled();
                    done();
                });
            });

            it('should call $state.go()', function(done) {
                promise.then(function() {
                    expect(state.go).toHaveBeenCalledWith('create_institution_form', {institutionKey: otherInstitution.key});
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
                            return callback(newInviteCtrl.user = new User(otherUser));
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

            it('should call $mdDialog.show()', function(done) {
                promise.then(function() {
                    expect(mdDialog.show).toHaveBeenCalled();
                    done();
                });
            });

            it('should call inviteService.deleteInvite()', function(done) {
                promise.then(function() {
                    expect(inviteService.deleteInvite).toHaveBeenCalledWith(invite.key);
                    done();
                });
            });

            it('should call authService.reload()', function(done) {
                promise.then(function() {
                    expect(authService.reload).toHaveBeenCalled();
                    done();
                });
            });

            it('should call $state.go()', function(done) {
                promise.then(function() {
                    expect(state.go).toHaveBeenCalledWith('app.home');
                    done();
                });
            });
        });

        describe('saveInstProfile()', function() {
            it('should call save()', function() {
                spyOn(authService, 'save');
                spyOn(newInviteCtrl.user, 'addProfile');
                newInviteCtrl.saveInstProfile();
                expect(newInviteCtrl.user.addProfile).toHaveBeenCalled();
                expect(authService.save).toHaveBeenCalled();
            });
        });
    });
}));