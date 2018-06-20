'use strict';

(describe('Test AcceptInviteController', function () {

    var acceptInviteCtrl, scope, httpBackend, inviteService, state, authService;

    var invite = new Invite({
        'key': '12300'
    });

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, $state, 
        InviteService, $stateParams, AuthService) {
        httpBackend = $httpBackend;
        state = $state;
        inviteService = InviteService;
        authService = AuthService;
        
        spyOn(inviteService, 'getInvite').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(invite);
                }
            };
        });

        $stateParams.id = invite.key;
        acceptInviteCtrl = $controller('AcceptInviteController', {
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
            spyOn(acceptInviteCtrl, 'cancelSignup');
            acceptInviteCtrl.displayLoading();
            expect(acceptInviteCtrl.loading).toBeTruthy();
            expect(acceptInviteCtrl.cancelSignup).toHaveBeenCalled();
        });
    });

    describe('goToHome', function () {
        it('should call state.go', function () {
            spyOn(state, 'go');
            acceptInviteCtrl.goToHome();
            expect(state.go).toHaveBeenCalledWith('app.user.home');
        });
    });

    describe('signin', function () {
        beforeEach(() => {
            spyOn(authService, 'isLoggedIn').and.callThrough();
            spyOn(state, 'go');
        });

        it('should go to new_invite', function () {
            acceptInviteCtrl.signin();
            expect(authService.isLoggedIn).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith("new_invite", {key: invite.key});
        });

        it('should go to signin', function () {
            authService.logout();
            acceptInviteCtrl.signin();
            expect(authService.isLoggedIn).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith("signin");
        });
    });

    describe('cancelSignup()', function() {
        it('should set signup to false', function () {
            acceptInviteCtrl.cancelSignup();
            expect(acceptInviteCtrl.signup).toBeFalsy();
        });
    });

    describe('errorHandler()', function() {
        it('should set loading to false', function() {
            acceptInviteCtrl.errorHandler();
            expect(acceptInviteCtrl.loading).toBeFalsy();
        });
    });
}));