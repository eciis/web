'use strict';

(describe('Test MainController', function() {
    var mainCtrl, httpBackend, scope, createCtrl, state, instService, authService, requestInvitationService;
    var user = {
        name: 'user',
        key: 'user-key',
        invites: [{
            'invitee': 'user@email.com',
            'suggestion_institution_name': "Suggested Name",
            'key': "inviteKey",
            'type_of_invite': "INSTITUTION",
            'status': 'sent',
            'stub_institution': {'name': 'Suggested Name',
                                 'key': '00001'}
        }],
        state: 'active'
    };
    var institution = {
        name: 'institution',
        key: '123456789',
        admin: user.key
    };

    var otherInstitution = {
        name: 'otherInstitution',
        key: '1239'
    };

    var institutionKey = institution.key;

    user.institutions = [institution, otherInstitution];
    user.institutions_admin = [institutionKey];
    user.current_institution = institution;
    user.permissions = {analyze_request_inst: {institutionKey: true}};

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, AuthService, InstitutionService,
            RequestInvitationService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        instService = InstitutionService;
        authService = AuthService;
        requestInvitationService = RequestInvitationService;

        var callFake = function() {
            return {
                then: function(callback) {
                    return callback([]);
                }
            };
        };

        spyOn(requestInvitationService, 'getRequests').and.callFake(callFake);
        spyOn(requestInvitationService, 'getParentRequests').and.callFake(callFake);
        spyOn(requestInvitationService, 'getChildrenRequests').and.callFake(callFake);

        authService.login(user);

        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "search_panel.html").respond(200);
        httpBackend.when('GET', "error/user_inactive.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        httpBackend.when('GET', "auth/login.html").respond(200);
        createCtrl = function() {
            return $controller('MainController', {
                scope: scope,
                AuthService: authService
            });
        };
        mainCtrl = createCtrl();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });


    describe('main()', function() {

        it("should change state to config_profile if user name is Unknown", function() {
            var unknownUser = {
              name: 'Unknown',
              invites: [],
              institutions: [otherInstitution],
              permissions: {},
              state: 'active'
            };

            authService.getCurrentUser = function() {
                return new User(unknownUser);
            };

            spyOn(state, 'go');

            mainCtrl = createCtrl();

            expect(state.go).toHaveBeenCalledWith('app.user.config_profile');
        });
    });

    describe('MainController functions', function() {
        it('Should be active', function() {
            expect(mainCtrl.isActive(institution)).toBe(true);
        });
        it('Should be not active', function() {
            expect(mainCtrl.isActive(otherInstitution)).toBe(false);
        });
        it('Should change active institution', function() {
            spyOn(mainCtrl.user, 'changeInstitution');
            var user_inst = {
                name: 'user_inst',
                key: 'veqw56eqw7r89',
                invites: [{
                    'invitee': 'user@email.com',
                    'suggestion_institution_name': "Suggested Name",
                    'type_of_invite': "institution",
                    'status': 'sent'
                }]
            };
            user_inst.institutions = [otherInstitution, institution];
            spyOn(mainCtrl, 'getPendingTasks');
            spyOn(authService, 'getCurrentUser').and.callFake(function () {
                return new User(user_inst);
            });
            
            mainCtrl.user = new User(user_inst);
    
            expect(mainCtrl.user.current_institution).toBe(otherInstitution);

            mainCtrl.changeInstitution({'institution_key': institution.key});

            expect(mainCtrl.user.current_institution).toBe(institution);
            expect(authService.getCurrentUser).toHaveBeenCalled();
            expect(mainCtrl.getPendingTasks).toHaveBeenCalled();
        });
        it('Should call state.go() in function goTo()', function(){
            spyOn(state, 'go');
            mainCtrl.goTo('app.user.home');
            expect(state.go).toHaveBeenCalledWith('app.user.home');
        });
        it('Should call state.go() in function goToInstitution()', function(){
            spyOn(state, 'go');
            mainCtrl.goToInstitution(otherInstitution.key);
            expect(state.go).toHaveBeenCalledWith('app.institution.timeline', {institutionKey: '1239'});
        });

        it('User should not be admin of your current institution', function(){
            expect(mainCtrl.isAdmin(mainCtrl.user.current_institution.key)).toBe(true);
        });
    });

    describe('Main Controller listenners', function(){

    });
}));