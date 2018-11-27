'use strict';

(describe('Test RedirectInviteInstitutionController', function () {

    var redirectInviteCtrl, scope, httpBackend, inviteService, state, authService, states;

    var invite = new Invite({
        'key': '12300'
    });

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, $state, 
        InviteService, $stateParams, AuthService, STATES) {
        httpBackend = $httpBackend;
        state = $state;
        inviteService = InviteService;
        authService = AuthService;
        states = STATES;

        spyOn(inviteService, 'getInvite').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(invite);
                }
            };
        });

        $stateParams.id = invite.key;
        redirectInviteCtrl = $controller('RedirectInviteInstitutionController', {
            InviteService: inviteService,
            state: state,
            $stateParams: $stateParams,
            AuthService: authService
        });

        expect(inviteService.getInvite).toHaveBeenCalled();
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('displayLoading()', function () {
        it('should call cancelSignup', function () {
            spyOn(redirectInviteCtrl, 'cancelSignup');
            redirectInviteCtrl.displayLoading();
            expect(redirectInviteCtrl.loading).toBeTruthy();
            expect(redirectInviteCtrl.cancelSignup).toHaveBeenCalled();
        });
    });

    describe('goToHome', function () {
        it('should call state.go', function () {
            spyOn(state, 'go');
            redirectInviteCtrl.goToHome();
            expect(state.go).toHaveBeenCalledWith(states.HOME);
        });
    });

    describe('signin', function () {
        beforeEach(() => {
            spyOn(authService, 'isLoggedIn').and.callThrough();
            spyOn(state, 'go');
        });

        it('should go to new_invite', function () {
            redirectInviteCtrl.signin();
            expect(authService.isLoggedIn).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith("new_invite", {key: invite.key});
        });

        it('should go to signin', function () {
            authService.logout();
            redirectInviteCtrl.signin();
            expect(authService.isLoggedIn).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith("signin");
        });
    });

    describe('cancelSignup()', function() {
        it('should set signup to false', function () {
            redirectInviteCtrl.cancelSignup();
            expect(redirectInviteCtrl.signup).toBeFalsy();
        });
    });

    describe('errorHandler()', function() {
        it('should set loading to false', function() {
            redirectInviteCtrl.errorHandler();
            expect(redirectInviteCtrl.loading).toBeFalsy();
        });
    });
}));