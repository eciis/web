'use strict';

(describe('Test MainController', function() {
    let mainCtrl, httpBackend, scope, createCtrl, state, states, mainToolbar;
    let authService, requestInvitationService, notificationListenerService, utilsService;
    let user = {
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
    let institution = {
        name: 'institution',
        key: '123456789',
        admin: user.key
    };

    let otherInstitution = {
        name: 'otherInstitution',
        key: '1239'
    };

    let institutionKey = institution.key;

    let EVENTS_TO_UPDATE_USER = ["DELETED_INSTITUTION", "DELETE_MEMBER", "ACCEPTED_LINK",
                                "ACCEPT_INSTITUTION_LINK", "TRANSFER_ADM_PERMISSIONS",
                                "ADD_ADM_PERMISSIONS", "ACCEPT_INVITE_INSTITUTION", "ACCEPT_INVITE_USER_ADM",
                                "REMOVE_INSTITUTION_LINK", "RE_ADD_ADM_PERMISSIONS"];

    user.institutions = [institution, otherInstitution];
    user.institutions_admin = [institutionKey];
    user.current_institution = institution;
    user.permissions = {analyze_request_inst: {institutionKey: true}};

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, AuthService,
                RequestInvitationService, NotificationListenerService, STATES, UtilsService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        states = STATES;
        authService = AuthService;
        requestInvitationService = RequestInvitationService;
        notificationListenerService = NotificationListenerService;
        utilsService = UtilsService;

        mainToolbar = document.createElement('div');
        mainToolbar.setAttribute("id", "main-toolbar");

        let callFake = function() {
            return {
                then: function(callback) {
                    return callback([]);
                }
            };
        };

        let eventsListenerFake = function eventsListenerFake(events, callback){
            events.forEach(event => {
                $rootScope.$on(event, function () {
                    authService.reload();
                });
            });
        };

        spyOn(requestInvitationService, 'getRequests').and.callFake(callFake);
        spyOn(requestInvitationService, 'getParentRequests').and.callFake(callFake);
        spyOn(requestInvitationService, 'getChildrenRequests').and.callFake(callFake);
        spyOn(NotificationListenerService, 'multipleEventsListener').and.callFake(eventsListenerFake);


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
            const unknownUser = {
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

            expect(state.go).toHaveBeenCalledWith(states.CONFIG_PROFILE);
        });

        it("should create observer", function() {
            mainCtrl = createCtrl();
            expect(notificationListenerService.multipleEventsListener).toHaveBeenCalledWith(EVENTS_TO_UPDATE_USER, mainCtrl.refreshUser);
        });
    });

    describe('MainController functions', function() {

        it('Should change active institution', function() {
            spyOn(mainCtrl.user, 'changeInstitution');
            let user_inst = {
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
            spyOn(utilsService, 'selectNavOption');
            spyOn(document, 'getElementById').and.returnValue(mainToolbar);
            mainCtrl.goTo('HOME');
            expect(utilsService.selectNavOption).toHaveBeenCalledWith(states.HOME);
        });

        it("should return the css class 'color-icon-selected-navbar' when the HOME option is selected", function(){
            spyOn(mainCtrl, '_getStateName').and.returnValue(states.HOME);            
            expect(mainCtrl.getSelectedClass("HOME")).toBe("color-icon-selected-navbar");
            expect(mainCtrl.getSelectedClass("EVENTS")).toBe("color-icon-navbar");
            expect(mainCtrl.getSelectedClass("NOTIFICATIONS")).toBe("color-icon-navbar");
        });

        it("should return the css class 'color-icon-selected-navbar' when the EVENTS option is selected", function(){
            spyOn(mainCtrl, '_getStateName').and.returnValue(states.EVENTS);            
            expect(mainCtrl.getSelectedClass("HOME")).toBe("color-icon-navbar");
            expect(mainCtrl.getSelectedClass("EVENTS")).toBe("color-icon-selected-navbar");
            expect(mainCtrl.getSelectedClass("NOTIFICATIONS")).toBe("color-icon-navbar");
        });
    });
    
    describe('Main Controller listenners', function(){
        it("Should call userService load when event 'DELETED_INSTITUTION' was create.", function(){
            spyOn(authService, 'reload').and.callThrough();
            scope.$emit("DELETED_INSTITUTION", {});
            expect(authService.reload).toHaveBeenCalled();
        });

        it("Should call userService load when event 'DELETE_MEMBER' was create.", function(){
            spyOn(authService, 'reload').and.callThrough();
            scope.$emit("DELETE_MEMBER", {});
            expect(authService.reload).toHaveBeenCalled();
        });

        it("Should call userService load when event 'ACCEPT_INSTITUTION_LINK' was create.", function(){
            spyOn(authService, 'reload').and.callThrough();
            scope.$emit("ACCEPT_INSTITUTION_LINK", {});
            expect(authService.reload).toHaveBeenCalled();
        });

        it("Should NOT call userService load when event 'EVENT' was create.", function(){
            spyOn(authService, 'reload').and.callThrough();
            scope.$emit("EVENT", {});
            expect(authService.reload).not.toHaveBeenCalled();
        });
    });
}));