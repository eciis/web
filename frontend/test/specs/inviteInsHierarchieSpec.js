'use strict';

(describe('Test InviteInstHierarchieController', function() {

    var inviteInstCtrl, httpBackend, scope, inviteService, createCtrl, state, mdToast, instService, requestInvitationService, mdDialog;

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
        key: '987654',
        sent_invitations: [],
        children_institutions: [],
        parent_institution: {splab},
        state: 'pending'
    };

    var certbio = {
        name: 'CERTBIO',
        key: '111111',
        sent_invitations: [],
        children_institutions: [],
        parent_institution: {},
        state: 'active'
    }

    var maiana = {
        name: 'Maiana',
        email: 'maiana.brito@gmail.com',
        key: '12345',
        institutions: [certbio],
        follows: [splab.key],
        invites:[]
    };

    var INSTITUTION_SEARCH_URI = '/api/search/institution?value=';

    splab['children_institutions'] = [ecis];

    splab = new Institution(splab);

    var invite = new Invite({invitee: "parent@gmail.com",
                        suggestion_institution_name : "Institution Parent",
                        type_of_invite: 'INSTITUTION_PARENT',
                        institution_key: splab.key,
                        admin_key: maiana.key});

    var inviteChildren = new Invite({invitee: "children@gmail.com",
                        suggestion_institution_name : "Children Institution",
                        type_of_invite: 'INSTITUTION_CHILDREN',
                        institution_key: splab.key,
                        admin_key: maiana.key});

    var childrenStub = new Institution({name: "Children Institution", state : "pending"});

    var request = {
        admin_name: 'example',
        institution_key: certbio.key,
        institution_requested_key: splab.key,
        key: '000000',
        sender: 'certbio_admin',
        status: 'sent',
    }

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope,
        $state, $mdToast, InviteService, AuthService, InstitutionService, RequestInvitationService, $mdDialog) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        mdToast = $mdToast;
        inviteService = InviteService;
        instService = InstitutionService;
        requestInvitationService = RequestInvitationService;
        mdDialog = $mdDialog;
        AuthService.getCurrentUser = function() {
            return new User(maiana);
        };
        httpBackend.expect('GET', '/api/institutions/' + splab.key).respond(splab);
        httpBackend.expect('GET', '/api/institutions/' + splab.key + '/requests/institution_parent').respond(certbio);
        httpBackend.expect('GET', '/api/institutions/' + splab.key + '/requests/institution_children').respond([]);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        createCtrl = function() {
            return $controller('InviteInstHierarchieController', {
                    scope: scope,
                    inviteService: InviteService
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

        it('should exist a user with name Maiana', function() {
            expect(inviteInstCtrl.user.name).toEqual(maiana.name);
        });

        it('should be equal to splab', function() {
            expect(inviteInstCtrl.institution.name).toEqual(splab.name);
            expect(inviteInstCtrl.institution.key).toEqual(splab.key);
        });
    });

    describe('InviteInstHierarchieController functions', function() {

        describe('goToInst()', function() {
            it('should be call state.go ', function() {
                spyOn(state, 'go');
                inviteInstCtrl.goToInst(splab.key);
                expect(state.go).toHaveBeenCalledWith('app.institution.timeline',
                    Object({ institutionKey: '987654321' }));
            });
        });

        it('Should active institution', function(){
            expect(inviteInstCtrl.isActive(splab)).toBe(true);
        });

        it('Should not active institution', function(){
            expect(inviteInstCtrl.isActive(ecis)).toBe(false);
        });

        describe('cancelInvite()', function() {
            it('should clear the object invite', function() {
                inviteInstCtrl.invite = {
                    invitee: "invitee@gmail.com",
                    suggestion_institution_name : "Institution Parent"};
                inviteInstCtrl.cancelInvite();
                expect(inviteInstCtrl.invite).toEqual({});
            });
        });

        describe('sendInstInvite() to parent institution', function() {
            beforeEach(function() {
                spyOn(inviteService, 'sendInvite').and.callFake(function() {return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
            });

            it('should call inviteService.sendInvite()', function(done) {
                inviteInstCtrl.invite = {
                    invitee: "parent@gmail.com",
                    suggestion_institution_name : "Institution Parent",
                    type_of_invite : "INSTITUTION_PARENT"};

                // Change current institution
                inviteInstCtrl.user.current_institution = ecis;

                var promise = inviteInstCtrl.sendInstInvite(invite);
                promise.then(function() {

                    expect(inviteService.sendInvite).toHaveBeenCalledWith({invite_body: invite});

                    // Verifying That Data Is Correctly Updated
                    expect(inviteInstCtrl.invite).toEqual({});
                    expect(inviteInstCtrl.institution.key).toEqual(splab.key);
                    expect(inviteInstCtrl.institution.sent_invitations).toEqual([invite]);
                    expect(inviteInstCtrl.institution.parent_institution.name).toEqual(
                        invite.suggestion_institution_name);
                    expect(inviteInstCtrl.hasParent).toEqual(true);

                    done();
                });
                scope.$apply();
            });
        });

        describe('sendInstInvite() to children Institution', function() {
            beforeEach(function() {
                spyOn(inviteService, 'sendInvite').and.callFake(function() {return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
            });

            it('should call inviteService.sendInvite()', function(done) {
                inviteInstCtrl.invite = {
                    invitee: "children@gmail.com",
                    suggestion_institution_name : "Children Institution",
                    type_of_invite : "INSTITUTION_CHILDREN"};

                // Change current institution
                inviteInstCtrl.user.current_institution = ecis;

                var promise = inviteInstCtrl.sendInstInvite(inviteChildren);
                promise.then(function() {
                    expect(inviteService.sendInvite).toHaveBeenCalledWith({invite_body: inviteChildren});

                    // Verifying That Data Is Correctly Updated
                    expect(inviteInstCtrl.invite).toEqual({});
                    expect(inviteInstCtrl.institution.key).toEqual(splab.key);
                    expect(inviteInstCtrl.institution.sent_invitations).toEqual([inviteChildren]);
                    expect(inviteInstCtrl.institution.children_institutions).toContain(childrenStub);

                    done();
                });
                scope.$apply();
            });
        });

        describe('checkInstInvite()', function() {
            it('should call sendInvite() and searchInstitutions()', function(done) {
                spyOn(instService, 'searchInstitutions').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback({});
                        }
                    };
                });
                spyOn(inviteInstCtrl, 'sendInstInvite');
                inviteInstCtrl.invite = {
                    invitee: "parent@gmail.com",
                    suggestion_institution_name : "Institution Parent",
                    type_of_invite : "INSTITUTION_PARENT"};
                inviteInstCtrl.user.current_institution = splab;
                inviteInstCtrl.checkInstInvite().then(function() {
                    expect(instService.searchInstitutions).toHaveBeenCalledWith(
                        inviteInstCtrl.invite.suggestion_institution_name,
                        "active,pending", 'institution');
                    expect(inviteInstCtrl.sendInstInvite).toHaveBeenCalledWith(invite);
                    done();
                });
            });

            it('should call showDialog()', function(done) {
                var documents = {data: {name: splab.name, id: splab.key}};
                spyOn(inviteInstCtrl, 'showDialog');
                spyOn(instService, 'searchInstitutions').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback(documents);
                        }
                    };
                });
                inviteInstCtrl.invite = {
                    invitee: "parent@gmail.com",
                    suggestion_institution_name : "Institution Parent",
                    type_of_invite : "institution_parent"};
                inviteInstCtrl.checkInstInvite().then(function() {
                    expect(inviteInstCtrl.showDialog).toHaveBeenCalled();
                    done();
                });
            });
        });

        describe('acceptRequest()', function() {
            it('should call accept parent request', function(done) {
                spyOn(mdDialog, 'show').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(requestInvitationService, 'acceptInstParentRequest').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(instService, 'getInstitution').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback({data: certbio, msg: 'success'});
                        }
                    };
                });
                var promise = inviteInstCtrl.acceptRequest(request, 'REQUEST_INSTITUTION_PARENT');
                promise.then(function() {
                    expect(requestInvitationService.acceptInstParentRequest).toHaveBeenCalledWith(request.key);
                    done();
                });
            });

            it('should call accept children request', function(done) {
                spyOn(mdDialog, 'show').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(requestInvitationService, 'acceptInstChildrenRequest').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(instService, 'getInstitution').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback({data: certbio, msg: 'success'});
                        }
                    };
                });
                var promise = inviteInstCtrl.acceptRequest(request, 'REQUEST_INSTITUTION_CHILDREN');
                promise.then(function() {
                    expect(requestInvitationService.acceptInstChildrenRequest).toHaveBeenCalledWith(request.key);
                    done();
                });
            });
        });

        describe('rejectRequest()', function() {
            it('should call reject parent request', function(done) {
                spyOn(mdDialog, 'show').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(requestInvitationService, 'rejectInstParentRequest').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                var promise = inviteInstCtrl.rejectRequest(request, 'REQUEST_INSTITUTION_PARENT');
                promise.then(function() {
                    expect(requestInvitationService.rejectInstParentRequest).toHaveBeenCalledWith(request.key);
                    done();
                });
            });

            it('should call reject children request', function(done) {
                spyOn(mdDialog, 'show').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                spyOn(requestInvitationService, 'rejectInstChildrenRequest').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
                var promise = inviteInstCtrl.rejectRequest(request, 'REQUEST_INSTITUTION_CHILDREN');
                promise.then(function() {
                    expect(requestInvitationService.rejectInstChildrenRequest).toHaveBeenCalledWith(request.key);
                    done();
                });
            });
        });
    });
}));